import { NextRequest, NextResponse } from 'next/server';
import { persistOrder, generateOrderNumber, type OrderRecord, type OrderAttribution } from '@/lib/orders';
import {products, AIR_SHIPPING_US} from '@/lib/data';
import { sendServerPurchaseEvent } from '@/lib/ga4-server';
import { lookupCoupon, couponDiscount } from '@/lib/coupons';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PayPal API credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const FREE_SHIPPING_THRESHOLD = 89;
const SHIPPING_FEE_UNDER = 5.99;

// Coalesce duplicate callbacks within this server instance. PayPal-Request-Id
// below provides the cross-request/cross-instance capture idempotency key.
const captureInFlight = new Map<string, Promise<any>>();
const PAYPAL_FETCH_TIMEOUT_MS = 20_000;

async function paypalFetchJson(
  input: string,
  init: RequestInit = {},
): Promise<{ response: Response; data: any }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAYPAL_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    // Keep the abort timer alive until the response body is fully consumed.
    // fetch() can resolve after headers while the JSON body remains stalled.
    const data = await response.json().catch(() => null);
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const { data } = await paypalFetchJson(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  return data.access_token;
}

// ---- Order persistence helper ----
// Builds an OrderRecord from a PayPal order/capture payload (+ client-supplied
// contact/attribution) and writes it to the durable store. Never throws and is
// safe to call on BOTH the fresh-capture branch and the alreadyCaptured branch:
// the store dedupes by PayPal order id, so repeated callbacks never create a
// duplicate order (and a previously failed write is healed on the next call).
async function persistCapturedOrder(
  paypalData: any,
  ctx: {
    attribution?: OrderAttribution;
    contactEmail?: string;
    contactName?: string;
    contactPhone?: string;
  },
) {
  try {
    const pu = paypalData?.purchase_units?.[0] || {};
    const cap = pu.payments?.captures?.[0] || {};

    const total = parseFloat(cap.amount?.value || '0') || 0;
    const currency = cap.amount?.currency_code || 'USD';

    const items: any[] = (pu.items || []).map((it: any) => ({
      name: it.name || 'Product',
      price: parseFloat(it.unit_amount?.value || '0') || 0,
      quantity: parseInt(it.quantity || '1', 10) || 1,
      slug: it.sku || undefined,
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

    const payerEmail = paypalData?.payer?.email_address || ctx.contactEmail || '';
    const payerName = paypalData?.payer?.name
      ? [paypalData.payer.name.given_name, paypalData.payer.name.surname].filter(Boolean).join(' ')
      : ctx.contactName || '';

    // Phone + coupon code: prefer explicit checkout contact for phone, fall
    // back to parsing custom_id (format "phone:<n>|coupon:<code>", either
    // segment optional).
    let phone = ctx.contactPhone || '';
    let couponCodeUsed = '';
    const customId: string = pu.custom_id || cap.custom_id || '';
    for (const segment of customId.split('|')) {
      if (!phone && segment.startsWith('phone:')) phone = segment.slice(6);
      if (segment.startsWith('coupon:')) couponCodeUsed = segment.slice(7);
    }

    // Re-derive discount from the coupon code rather than trusting anything
    // PayPal echoes back — the coupon's percentOff is the single source of
    // truth (same lookup the order-creation step used to size the actual
    // charge), so this stays consistent even if PayPal's response shape
    // omits the amount breakdown.
    const appliedCoupon = couponCodeUsed ? lookupCoupon(couponCodeUsed) : null;
    const discountAmount = appliedCoupon ? couponDiscount(appliedCoupon, subtotal) : 0;
    const shippingCost = Math.max(0, +(total - subtotal + discountAmount).toFixed(2));

    const sh = pu.shipping || {};
    const sa = sh.address || {};

    const order: OrderRecord = {
      order_number: generateOrderNumber(paypalData.id),
      paypal_order_id: paypalData.id,
      paypal_capture_id: cap.id || undefined,
      payment_method: 'paypal',
      status: paypalData.status || 'COMPLETED',
      created_at: cap.create_time || new Date().toISOString(),
      customer: {
        name: payerName || sh.name?.full_name || undefined,
        email: payerEmail || undefined,
        phone: phone || undefined,
      },
      shipping_address: {
        name: sh.name?.full_name || payerName || undefined,
        address_line_1: sa.address_line_1 || undefined,
        city: sa.admin_area_2 || undefined,
        state: sa.admin_area_1 || undefined,
        postal_code: sa.postal_code || undefined,
        country: sa.country_code || undefined,
      },
      items,
      subtotal: +subtotal.toFixed(2),
      shipping: shippingCost,
      discount: discountAmount > 0 ? discountAmount : undefined,
      coupon_code: couponCodeUsed || undefined,
      total,
      currency,
      attribution: ctx.attribution && Object.keys(ctx.attribution).length ? ctx.attribution : undefined,
      source: 'web-paypal-capture',
    };

    const result = await persistOrder(order);
    console.log('[orders] persist result for', paypalData.id, JSON.stringify(result));
    return { order, result };
  } catch (e: any) {
    console.error('[orders] persistCapturedOrder error:', e?.message || e);
    return { order: null, result: { persisted: false, reason: 'exception' } };
  }
}

async function getCompletedOrder(orderId: string, accessToken: string) {
  const { response, data } = await paypalFetchJson(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  return response.ok && data?.status === 'COMPLETED' ? data : null;
}

function isOrderAlreadyCaptured(data: any) {
  return data?.details?.some((detail: any) => detail?.issue === 'ORDER_ALREADY_CAPTURED');
}

async function completedOrderResponse(
  existingData: any,
  attribution: OrderAttribution,
  contact: { email?: string; name?: string; phone?: string },
) {
  let existAmount = 0;
  let existPayerEmail = contact.email || '';
  let existPayerName = contact.name || '';
  let existItems: any[] = [];
  let existCaptureId = '';
  try {
    const cap0 = existingData.purchase_units?.[0]?.payments?.captures?.[0];
    if (cap0?.amount) existAmount = parseFloat(cap0.amount.value) || 0;
    if (cap0?.id) existCaptureId = cap0.id;
    const pu0 = existingData.purchase_units?.[0]?.items;
    if (Array.isArray(pu0)) {
      existItems = pu0.map((item: any) => ({
        name: item.name,
        price: parseFloat(item.unit_amount?.value || '0'),
        quantity: parseInt(item.quantity || '1', 10),
        slug: item.sku || undefined,
      }));
    }
    if (existingData.payer?.email_address) existPayerEmail = existingData.payer.email_address;
    const nm = existingData.payer?.name;
    if (nm) existPayerName = [nm.given_name, nm.surname].filter(Boolean).join(' ') || existPayerName;
  } catch {}

  // Persistence remains idempotent and can heal a previously failed write.
  // Customer/merchant emails and GA4 are deliberately NOT repeated here.
  const backfill = await persistCapturedOrder(existingData, {
    attribution,
    contactEmail: contact.email,
    contactName: contact.name,
    contactPhone: contact.phone,
  }).catch(() => null);

  return NextResponse.json({
    success: true,
    orderId: existingData.id,
    orderNumber: backfill?.order?.order_number || generateOrderNumber(existingData.id),
    captureId: existCaptureId,
    status: existingData.status,
    alreadyCaptured: true,
    amount: existAmount,
    currency: 'USD',
    payerEmail: existPayerEmail,
    payerName: existPayerName,
    items: existItems,
    persisted: backfill?.result?.persisted === true,
    confirmationEmailStatus: 'unavailable',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items: rawItems, shippingAddress, couponCode, shippingMethod, shippingCountry } = body;

    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Never trust client-supplied prices: look up the authoritative price for
    // each item server-side by slug so a tampered request can't check out at
    // an arbitrary amount.
    const priceBySlug = new Map(products.map((p) => [p.slug, p.price]));
    const items: { name: string; price: number; quantity: number; slug?: string }[] = [];
    for (const raw of rawItems as { name?: string; quantity: number; slug?: string }[]) {
      const realPrice = raw.slug ? priceBySlug.get(raw.slug) : undefined;
      if (realPrice === undefined) {
        return NextResponse.json({ error: `Unknown product: ${raw.slug || raw.name}` }, { status: 400 });
      }
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(raw.quantity) || 1)));
      items.push({ name: raw.name || raw.slug!, price: realPrice, quantity, slug: raw.slug });
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0,
    );
    // Free-shipping threshold is evaluated on the pre-discount subtotal, so a
    // coupon never strips away free shipping the cart would otherwise earn.
    const isAir = shippingMethod === 'faster';
  // 2026-11-06 袁总令：运费统一两个标准——快速档全球一口价 $10（3-7 工作日）
  const shipping = isAir
    ? AIR_SHIPPING_US
    : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_UNDER);
    // Never trust a client-supplied discount — look the code up server-side.
    const coupon = lookupCoupon(couponCode);
    const discount = coupon ? couponDiscount(coupon, subtotal) : 0;
    const total = +(subtotal - discount + shipping).toFixed(2);

    const accessToken = await getAccessToken();

    const { data: orderData } = await paypalFetchJson(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: subtotal.toFixed(2),
                },
                shipping: {
                  currency_code: 'USD',
                  value: shipping.toFixed(2),
                },
                ...(discount > 0
                  ? { discount: { currency_code: 'USD', value: discount.toFixed(2) } }
                  : {}),
              },
            },
            items: items.map((item: { name: string; price: number; quantity: number; slug?: string }) => ({
              name: item.name,
              unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2),
              },
              quantity: item.quantity.toString(),
              // Carry the product slug through as SKU so capture returns it
              // (used for GA4 item_id and the persisted order line items).
              sku: item.slug ? String(item.slug).slice(0, 127) : undefined,
            })),
            shipping: shippingAddress
              ? {
                  name: { full_name: shippingAddress.name },
                  address: {
                    address_line_1: shippingAddress.address,
                    admin_area_2: shippingAddress.city,
                    admin_area_1: shippingAddress.state,
                    postal_code: shippingAddress.postalCode,
                    country_code: shippingAddress.country || 'US',
                  },
                }
              : undefined,
            // Customer phone + applied coupon carried through to the capture
            // response (PayPal has no dedicated fields for either in v2
            // orders); used for the merchant notification and order record.
            custom_id: (() => {
              const parts: string[] = [];
              if (shippingAddress?.phone) parts.push(`phone:${String(shippingAddress.phone).slice(0, 30)}`);
              if (coupon) parts.push(`coupon:${coupon.code}`);
              return parts.length ? parts.join('|').slice(0, 127) : undefined;
            })(),
          },
        ],
        application_context: {
          brand_name: 'FreshLock',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freshlocksealer.com'}/checkout/success?payment_method=paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freshlocksealer.com'}/checkout`,
        },
      }),
    });

    const approveLink = orderData.links?.find((link: { rel: string }) => link.rel === 'approve');

    if (!approveLink) {
      console.error('PayPal order response:', JSON.stringify(orderData));
      throw new Error('Could not get PayPal approval URL');
    }

    return NextResponse.json({ orderId: orderData.id, approvalUrl: approveLink.href });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const reqBody = await request.json().catch(() => ({}));
  const orderId = reqBody?.orderId;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const pending = captureInFlight.get(orderId);
  if (pending) {
    try { await pending; } catch {}
  }

  const capture = capturePayPalOrder(request, reqBody);
  captureInFlight.set(orderId, capture);
  try {
    return await capture;
  } finally {
    if (captureInFlight.get(orderId) === capture) captureInFlight.delete(orderId);
  }
}

async function capturePayPalOrder(request: NextRequest, reqBody: any) {
  const orderId = reqBody.orderId;
  const attribution: OrderAttribution = reqBody?.attribution || undefined;
  const contact: { email?: string; name?: string; phone?: string } = reqBody?.contact || {};
  try {
    const accessToken = await getAccessToken();

    // A sequential refresh or a request that waited on our in-flight lock
    // resolves here without another capture or repeated side effects.
    try {
      const existingData = await getCompletedOrder(orderId, accessToken);
      if (existingData) return completedOrderResponse(existingData, attribution, contact);
    } catch (e) {
      // If the pre-check fails, capture remains the authoritative next step.
      console.error('Order pre-check error:', e);
    }

    const { response: captureResponse, data: captureData } = await paypalFetchJson(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `freshlock-capture-${orderId}`,
      },
    });
    // Another instance may have won the capture race. Re-read the order and
    // treat a confirmed COMPLETED order as the same idempotent success.
    if (isOrderAlreadyCaptured(captureData)) {
      try {
        const completed = await getCompletedOrder(orderId, accessToken);
        if (completed) return completedOrderResponse(completed, attribution, contact);
      } catch (e) {
        console.error('Already-captured order re-check error:', e);
      }
    }

    if (!captureData) {
      return NextResponse.json(
        { error: 'PayPal returned an unreadable capture response. Please contact support before retrying.' },
        { status: 502 },
      );
    }

    if (captureResponse.ok && captureData.status === 'COMPLETED') {
      // Extract amount and payer info from capture response
      let amount = 0;
      let currency = 'USD';
      let payerEmail = '';
      let payerName = '';
      let orderItems: any[] = [];

      try {
        const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
        if (capture?.amount) {
          amount = parseFloat(capture.amount.value) || 0;
          currency = capture.amount.currency_code || 'USD';
        }
        // Extract items from purchase unit
        const puItems = captureData.purchase_units?.[0]?.items;
        if (puItems && Array.isArray(puItems)) {
          orderItems = puItems.map((item: any) => ({
            name: item.name,
            slug: item.sku || undefined,
            price: parseFloat(item.unit_amount?.value || '0'),
            quantity: parseInt(item.quantity || '1', 10),
          }));
        }
        // Payer info
        if (captureData.payer) {
          payerEmail = captureData.payer.email_address || contact.email || '';
          const name = captureData.payer.name;
          if (name) {
            payerName = [name.given_name, name.surname].filter(Boolean).join(' ');
          }
        }
      } catch (e) {
        console.error('Error parsing capture data:', e);
      }

      // ---- Persist the captured order to the durable store (fire & await, but
      // never fail the response on persistence errors). Deduped by PayPal order
      // id inside persistCapturedOrder/persistOrder — safe on repeated calls.
      const persisted = await persistCapturedOrder(captureData, {
        attribution,
        contactEmail: contact.email,
        contactName: contact.name,
        contactPhone: contact.phone,
      }).catch((e) => { console.error('order persist await error:', e); return null; });

      // Sole purchase analytics emission point. alreadyCaptured responses and
      // the browser success page deliberately do not emit another purchase.
      sendServerPurchaseEvent({
        orderId: captureData.id,
        items: orderItems.map((it) => ({
          item_id: it.slug || '',
          item_name: it.name || 'Product',
          price: it.price || 0,
          quantity: it.quantity || 1,
          item_category: 'sealer',
        })),
        value: amount,
        currency,
        cookieHeader: request.headers.get('cookie'),
      }).catch(() => {});

      const captureEmail = captureData.payer?.email_address || contact.email || '';
      const captureName = captureData.payer?.name
        ? [captureData.payer.name.given_name, captureData.payer.name.surname].filter(Boolean).join(' ')
        : contact.name || '';
      let confirmationEmailStatus: 'sent' | 'failed' | 'not_configured' | 'no_email' =
        captureEmail ? 'not_configured' : 'no_email';

      // Await the customer send so the response never claims an email was sent
      // when SMTP was not configured or rejected the message.
      try {
        const { sendEmail } = await import('@/lib/smtp');
        const SMTP_PASS = process.env.SMTP_PASS;
        if (SMTP_PASS) {
          let captureAmount = 0;
          try {
            const cap = captureData.purchase_units?.[0]?.payments?.captures?.[0];
            if (cap?.amount) captureAmount = parseFloat(cap.amount.value) || 0;
          } catch {}
          if (captureEmail) {
            const itemsHtml = (captureData.purchase_units?.[0]?.items || []).map((item: any) =>
              `<tr><td style="padding:6px 0;">${item.name} ×${item.quantity}</td><td style="padding:6px 0;text-align:right;">$${(parseFloat(item.unit_amount?.value||'0')*parseInt(item.quantity||'1')).toFixed(2)}</td></tr>`
            ).join('');
            const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
              <div style="background:#0f4c3a;padding:24px;text-align:center;"><h1 style="color:#fff;margin:0;">Order Confirmed! ✅</h1></div>
              <div style="padding:24px;">
                <p>Hi ${captureName || 'there'},</p>
                <p>Thank you for your FreshLock purchase! Your payment has been confirmed.</p>
                <p><strong>Order ID:</strong> ${captureData.id}</p>
                <div style="background:#f0f7f4;border-radius:8px;padding:16px;margin:16px 0;">
                  <table style="width:100%;border-collapse:collapse;">${itemsHtml}
                    <tr style="border-top:2px solid #0f4c3a;"><td style="padding:8px 0;font-weight:bold;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;">$${captureAmount.toFixed(2)}</td></tr>
                  </table>
                </div>
                <h3>What's Next?</h3>
                <ul><li>📦 We'll prepare your order within 1-2 business days</li><li>🚚 Standard shipping takes 7–15 days</li><li>📧 You'll receive a tracking number via email</li></ul>
                <p style="color:#666;font-size:14px;margin-top:24px;">Questions? Reply to this email, contact support@freshlocksealer.com, or WhatsApp <a href="https://wa.me/8618316990301" style="color:#0f4c3a; font-weight:bold;">+86 183 1699 0301</a></p>
              </div></div>`;
            let smtpTimeout: ReturnType<typeof setTimeout> | undefined;
            try {
              await Promise.race([
                sendEmail({
                  host: process.env.SMTP_HOST || 'smtp.zoho.com',
                  port: Number(process.env.SMTP_PORT || 587),
                  user: process.env.SMTP_USER || 'support@freshlocksealer.com',
                  pass: SMTP_PASS,
                  from: `FreshLock <${process.env.SMTP_USER || 'support@freshlocksealer.com'}>`,
                  to: captureEmail,
                  subject: `FreshLock Order Confirmed — ${captureData.id}`,
                  html: emailHtml,
                }),
                new Promise((_, reject) => {
                  smtpTimeout = setTimeout(() => reject(new Error('Confirmation email timeout')), 8000);
                }),
              ]);
              confirmationEmailStatus = 'sent';
            } catch (e: any) {
              confirmationEmailStatus = 'failed';
              console.error('Confirmation email error:', e);
            } finally {
              if (smtpTimeout) clearTimeout(smtpTimeout);
            }
          }
        }
      } catch (e) {
        if (captureEmail) confirmationEmailStatus = 'failed';
        console.error('Email send setup error:', e);
      }

      // ---- Merchant order notification (instant alert to the store owner) ----
      // Fires once per genuinely captured order (the idempotency guard above
      // returns early for duplicates, so this path is not repeated).
      try {
        const { sendEmail: sendMerchantEmail } = await import('@/lib/smtp');
        const SMTP_PASS_M = process.env.SMTP_PASS;
        if (SMTP_PASS_M) {
          let mAmount = 0;
          let mName = contact.name || ''; let mEmail = contact.email || ''; let mPhone = contact.phone || '';
          let mAddr = ''; let mCapId = '';
          try {
            const puM: any = captureData.purchase_units?.[0] || {};
            const capM = puM.payments?.captures?.[0];
            if (capM?.amount) mAmount = parseFloat(capM.amount.value) || 0;
            if (capM?.id) mCapId = capM.id;
            const custId: string = puM.custom_id || capM?.custom_id || '';
            for (const seg of custId.split('|')) {
              if (seg.startsWith('phone:')) mPhone = seg.slice(6);
            }
            if (captureData.payer) {
              mEmail = captureData.payer.email_address || contact.email || '';
              const pn = captureData.payer.name;
              if (pn) mName = [pn.given_name, pn.surname].filter(Boolean).join(' ') || mName;
            }
            const sh = puM.shipping;
            if (sh) {
              if (!mName && sh.name?.full_name) mName = sh.name.full_name;
              const a = sh.address || {};
              mAddr = [a.address_line_1, a.admin_area_2, a.admin_area_1, a.postal_code, a.country_code]
                .filter(Boolean).join(', ');
            }
          } catch {}
          const mItemsHtml = (captureData.purchase_units?.[0]?.items || []).map((item: any) =>
            `<tr><td style="padding:4px 0;">${item.name} &times;${item.quantity}</td><td style="padding:4px 0;text-align:right;">$${(parseFloat(item.unit_amount?.value||'0')*parseInt(item.quantity||'1')).toFixed(2)}</td></tr>`
          ).join('');
          const merchantHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
            <div style="background:#b45309;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;">&#128717; NEW ORDER — FreshLock</h1></div>
            <div style="padding:20px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:4px 0;color:#666;width:130px;">Order ID</td><td style="padding:4px 0;font-weight:bold;">${captureData.id}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">PayPal Capture</td><td style="padding:4px 0;">${mCapId}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">Total</td><td style="padding:4px 0;font-weight:bold;color:#0f4c3a;font-size:16px;">$${mAmount.toFixed(2)} USD</td></tr>
                <tr><td style="padding:4px 0;color:#666;">Customer</td><td style="padding:4px 0;font-weight:bold;">${mName || '—'}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;">${mEmail || '—'}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">Phone</td><td style="padding:4px 0;">${mPhone || '— (on PayPal account / shipping label)'}</td></tr>
                <tr><td style="padding:4px 0;color:#666;vertical-align:top;">Ship to</td><td style="padding:4px 0;">${mAddr || '—'}</td></tr>
              </table>
              <div style="background:#f7f7f7;border-radius:8px;padding:12px;margin:14px 0;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;">${mItemsHtml}
                  <tr style="border-top:2px solid #b45309;"><td style="padding:6px 0;font-weight:bold;">Total</td><td style="padding:6px 0;text-align:right;font-weight:bold;">$${mAmount.toFixed(2)}</td></tr>
                </table>
              </div>
              <p style="font-size:13px;color:#666;">Packing reminder: 1.5kg parcel, add 5 extra medium + 5 extra large bags. Tell the customer the white round foam in the valve must stay in place.</p>
            </div></div>`;
          // Store archive + owner Gmail (phone push). Fire-and-forget.
          sendMerchantEmail({
            host: process.env.SMTP_HOST || 'smtp.zoho.com',
            port: Number(process.env.SMTP_PORT || 587),
            user: process.env.SMTP_USER || 'support@freshlocksealer.com',
            pass: SMTP_PASS_M,
            from: `FreshLock Orders <${process.env.SMTP_USER || 'support@freshlocksealer.com'}>`,
            to: ['support@freshlocksealer.com', 'jasonyuan866@gmail.com'],
            subject: `NEW ORDER $${mAmount.toFixed(2)} — ${mName || 'customer'} (${captureData.id})`,
            html: merchantHtml,
          }).catch((e: any) => console.error('Merchant notify email error:', e));
        }
      } catch (e) {
        console.error('Merchant notify setup error:', e);
      }

      return NextResponse.json({
        success: true,
        orderId: captureData.id,
        orderNumber: persisted?.order?.order_number || generateOrderNumber(captureData.id),
        captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || '',
        status: captureData.status,
        amount: amount,
        currency: currency,
        payerEmail: payerEmail || contact.email || '',
        payerName: payerName || contact.name || '',
        items: orderItems,
        persisted: persisted?.result?.persisted === true,
        confirmationEmailStatus,
      });
    }

    // Order might already been captured or in another state
    if (captureData.status === 'PAYER_ACTION_REQUIRED') {
      return NextResponse.json(
        { error: 'Payment needs buyer approval. Please try again.' },
        { status: 400 },
      );
    }

    console.error('PayPal capture unexpected status:', captureData.status, JSON.stringify(captureData));
    return NextResponse.json(
      { error: `Payment status: ${captureData.status}. Please contact support.` },
      { status: 400 },
    );
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 });
  }
}


// GET /api/paypal/config — returns PayPal client ID for frontend SDK loading
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  if (url.searchParams.get('clientId') === 'true' || url.pathname.endsWith('/config')) {
    return NextResponse.json({ clientId: PAYPAL_CLIENT_ID });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
