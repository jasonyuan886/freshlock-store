import { NextRequest, NextResponse } from 'next/server';
import {
  generateOrderNumber,
  persistOrder,
  type OrderItemRecord,
  type OrderRecord,
} from '@/lib/orders';
import { couponDiscount, lookupCoupon } from '@/lib/coupons';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';
const PAYPAL_FETCH_TIMEOUT_MS = 20_000;
const MAX_WEBHOOK_BODY_BYTES = 1_000_000;

// Only the capture-completed event has a persistence action in this iteration.
// Refund/dispute branches are intentionally acknowledged no-ops until their
// reconciliation state machines are designed and implemented separately.
const UNIMPLEMENTED_RECONCILIATION_EVENTS = new Set([
  'PAYMENT.CAPTURE.REFUNDED',
  'PAYMENT.CAPTURE.REVERSED',
  'CUSTOMER.DISPUTE.CREATED',
  'CUSTOMER.DISPUTE.UPDATED',
  'CUSTOMER.DISPUTE.RESOLVED',
]);

class InvalidOrderPayloadError extends Error {}

function logEvent(event: string, details: Record<string, string | undefined> = {}) {
  console.info('[paypal-webhook]', JSON.stringify({ event, ...details }));
}

async function paypalFetchJson(
  input: string,
  init: RequestInit = {},
): Promise<{ response: Response; data: any }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAYPAL_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    let data: any = null;
    try {
      // Keep the deadline active until the response body has been consumed.
      data = await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw error;
      // A non-JSON upstream response is handled by the caller as unavailable;
      // its body is deliberately neither returned nor logged.
    }
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const { response, data } = await paypalFetchJson(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok || typeof data?.access_token !== 'string' || !data.access_token) {
    throw new Error('PayPal access token unavailable');
  }
  return data.access_token;
}

function buildOrderRecord(paypalData: any): OrderRecord {
  const purchaseUnit = paypalData?.purchase_units?.[0] || {};
  const capture = purchaseUnit?.payments?.captures?.[0] || {};
  const total = Number.parseFloat(capture?.amount?.value || '');
  if (
    typeof paypalData?.id !== 'string'
    || typeof capture?.id !== 'string'
    || !Number.isFinite(total)
    || total < 0
    || typeof capture?.amount?.currency_code !== 'string'
  ) {
    throw new InvalidOrderPayloadError('Completed order lacks capture details');
  }

  const items: OrderItemRecord[] = (Array.isArray(purchaseUnit.items) ? purchaseUnit.items : []).map((item: any) => ({
    name: item?.name || 'Product',
    price: Number.parseFloat(item?.unit_amount?.value || '0') || 0,
    quantity: Number.parseInt(item?.quantity || '1', 10) || 1,
    slug: item?.sku || undefined,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const payerName = paypalData?.payer?.name
    ? [paypalData.payer.name.given_name, paypalData.payer.name.surname].filter(Boolean).join(' ')
    : '';
  const shipping = purchaseUnit.shipping || {};
  const address = shipping.address || {};

  // custom_id was fixed by our server when the order was created and is now
  // returned by PayPal's authoritative Order GET. The event body is not used.
  let phone = '';
  let couponCode = '';
  const customId: string = purchaseUnit.custom_id || capture.custom_id || '';
  for (const segment of customId.split('|')) {
    if (!phone && segment.startsWith('phone:')) phone = segment.slice(6);
    if (segment.startsWith('coupon:')) couponCode = segment.slice(7);
  }
  const coupon = couponCode ? lookupCoupon(couponCode) : null;
  const discount = coupon ? couponDiscount(coupon, subtotal) : 0;
  const shippingCost = Math.max(0, +(total - subtotal + discount).toFixed(2));

  return {
    order_number: generateOrderNumber(paypalData.id),
    paypal_order_id: paypalData.id,
    paypal_capture_id: capture.id,
    payment_method: 'paypal',
    status: 'COMPLETED',
    created_at: capture.create_time || paypalData.update_time || paypalData.create_time || new Date().toISOString(),
    customer: {
      name: payerName || shipping.name?.full_name || undefined,
      email: paypalData?.payer?.email_address || undefined,
      phone: phone || undefined,
    },
    shipping_address: {
      name: shipping.name?.full_name || payerName || undefined,
      address_line_1: address.address_line_1 || undefined,
      city: address.admin_area_2 || undefined,
      state: address.admin_area_1 || undefined,
      postal_code: address.postal_code || undefined,
      country: address.country_code || undefined,
    },
    items,
    subtotal: +subtotal.toFixed(2),
    shipping: shippingCost,
    discount: discount > 0 ? discount : undefined,
    coupon_code: couponCode || undefined,
    total,
    currency: capture.amount.currency_code,
    // Browser attribution is unavailable to an independent server webhook.
    attribution: undefined,
    source: 'webhook-paypal-capture-completed',
  };
}

function json(status: string, httpStatus = 200, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ status, ...extra }, { status: httpStatus });
}

export async function POST(request: NextRequest) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !PAYPAL_WEBHOOK_ID) {
    logEvent('configuration_error');
    return json('configuration_error', 500, { retryable: false });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_WEBHOOK_BODY_BYTES) {
    return json('invalid_event', 400);
  }

  let webhookEvent: any;
  try {
    webhookEvent = JSON.parse(rawBody);
  } catch {
    return json('malformed_json', 400);
  }
  if (!webhookEvent || typeof webhookEvent !== 'object' || Array.isArray(webhookEvent)) {
    return json('invalid_event', 400);
  }

  const transmission = {
    auth_algo: request.headers.get('paypal-auth-algo'),
    cert_url: request.headers.get('paypal-cert-url'),
    transmission_id: request.headers.get('paypal-transmission-id'),
    transmission_sig: request.headers.get('paypal-transmission-sig'),
    transmission_time: request.headers.get('paypal-transmission-time'),
  };
  if (Object.values(transmission).some((value) => !value)) {
    return json('missing_transmission_headers', 400);
  }

  const eventType = typeof webhookEvent.event_type === 'string' ? webhookEvent.event_type : undefined;
  const eventId = typeof webhookEvent.id === 'string' ? webhookEvent.id : undefined;

  try {
    const accessToken = await getAccessToken();

    // PayPal's postback API is the only signature verifier. cert_url is sent
    // back as an opaque verification field and is never fetched by this app.
    const verification = await paypalFetchJson(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...transmission,
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    });

    if (!verification.response.ok) {
      logEvent('verification_unavailable', { eventType, eventId, httpStatus: String(verification.response.status) });
      return json('verification_unavailable', 502, { retryable: true });
    }
    if (verification.data?.verification_status !== 'SUCCESS') {
      logEvent('invalid_signature', { eventType, eventId });
      return json('invalid_signature', 401, { retryable: false });
    }

    logEvent('verified', { eventType, eventId });

    if (eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
      const disposition = eventType && UNIMPLEMENTED_RECONCILIATION_EVENTS.has(eventType)
        ? 'unimplemented_reconciliation_event'
        : 'non_target_event';
      logEvent('ignored', { eventType, eventId, reason: disposition });
      return json('ignored', 200, { reason: disposition });
    }

    const orderId = webhookEvent?.resource?.supplementary_data?.related_ids?.order_id;
    if (typeof orderId !== 'string' || !orderId) {
      logEvent('missing_order_id', { eventType, eventId });
      return json('missing_order_id', 400);
    }
    if (!/^[A-Za-z0-9-]{1,64}$/.test(orderId)) {
      logEvent('invalid_order_id', { eventType, eventId });
      return json('invalid_order_id', 400);
    }

    // Never persist event-supplied money, payer, shipping, or item fields.
    // Re-read the order from PayPal and require both ID agreement and COMPLETED.
    const lookup = await paypalFetchJson(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!lookup.response.ok || !lookup.data) {
      logEvent('order_lookup_failed', { eventType, eventId, orderId, httpStatus: String(lookup.response.status) });
      return json('order_lookup_failed', 502, { retryable: true });
    }
    if (lookup.data.id !== orderId) {
      logEvent('order_lookup_failed', { eventType, eventId, orderId, reason: 'id_mismatch' });
      return json('order_lookup_failed', 502, { retryable: true });
    }
    if (lookup.data.status !== 'COMPLETED') {
      // A capture-completed notification can briefly race the Order GET view.
      // Do not persist, but keep the delivery retryable instead of acknowledging
      // away the only reconciliation opportunity.
      logEvent('order_not_completed', { eventType, eventId, orderId });
      return json('order_not_completed', 409, { retryable: true });
    }

    let order: OrderRecord;
    try {
      order = buildOrderRecord(lookup.data);
    } catch (error) {
      if (!(error instanceof InvalidOrderPayloadError)) throw error;
      logEvent('order_payload_invalid', { eventType, eventId, orderId });
      return json('order_payload_invalid', 502, { retryable: true });
    }

    let persistence;
    try {
      persistence = await persistOrder(order);
    } catch {
      logEvent('persistence_failed', { eventType, eventId, orderId });
      return json('persistence_failed', 503, { retryable: true });
    }

    if (!persistence.persisted) {
      logEvent('persistence_failed', { eventType, eventId, orderId, reason: persistence.reason });
      return json('persistence_failed', 503, { retryable: true });
    }

    const persistedStatus = persistence.reason === 'already_exists' ? 'already_exists' : 'persisted';
    logEvent(persistedStatus, { eventType, eventId, orderId });
    return json(persistedStatus, 200, { orderId });
  } catch {
    // Network errors and aborts are retryable. Do not expose upstream bodies,
    // credentials, stack traces, webhook content, or customer data.
    logEvent('paypal_unavailable', { eventType, eventId });
    return json('paypal_unavailable', 503, { retryable: true });
  }
}
