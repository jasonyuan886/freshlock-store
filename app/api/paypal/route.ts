import { NextRequest, NextResponse } from 'next/server';
import { persistOrder, generateOrderNumber, type OrderRecord, type OrderAttribution } from '@/lib/orders';

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

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
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
    const shippingCost = Math.max(0, +(total - subtotal).toFixed(2));

    const payerEmail = paypalData?.payer?.email_address || ctx.contactEmail || '';
    const payerName = paypalData?.payer?.name
      ? [paypalData.payer.name.given_name, paypalData.payer.name.surname].filter(Boolean).join(' ')
      : ctx.contactName || '';

    // Phone: prefer explicit checkout contact, fall back to custom_id "phone:..".
    let phone = ctx.contactPhone || '';
    const customId: string = pu.custom_id || cap.custom_id || '';
    if (!phone && customId.startsWith('phone:')) phone = customId.slice(6);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_UNDER;
    const total = subtotal + shipping;

    const accessToken = await getAccessToken();

    const paypalOrder = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
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
            // Customer phone carried through to capture response (PayPal has no
            // dedicated phone field in v2 orders); used for the merchant order
            // notification / shipping label.
            custom_id: shippingAddress?.phone ? `phone:${String(shippingAddress.phone).slice(0, 30)}` : undefined,
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

    const orderData = await paypalOrder.json();
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
  try {
    const reqBody = await request.json().catch(() => ({}));
    const orderId = reqBody?.orderId;
    // Marketing attribution (UTM / referrer) captured client-side and the
    // checkout contact details (the PayPal v2 capture does not return the
    // customer email in live mode) are sent by the success page alongside the
    // order id so they can be persisted with the order.
    const attribution: OrderAttribution = reqBody?.attribution || undefined;
    const contact: { email?: string; name?: string; phone?: string } = reqBody?.contact || {};
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    const accessToken = await getAccessToken();

    // Idempotency guard: if the order was already captured (e.g. success page
    // re-render or a duplicated callback), return success WITHOUT capturing again
    // or re-sending the confirmation email. Prevents duplicate "Order Confirmed" emails.
    try {
      const existingRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      const existingData = await existingRes.json();
      if (existingRes.ok && existingData.status === 'COMPLETED') {
        let existAmount = 0; let existPayerEmail = ''; let existPayerName = ''; let existItems: any[] = []; let existCaptureId = '';
        try {
          const cap0 = existingData.purchase_units?.[0]?.payments?.captures?.[0];
          if (cap0?.amount) existAmount = parseFloat(cap0.amount.value) || 0;
          if (cap0?.id) existCaptureId = cap0.id;
          const pu0 = existingData.purchase_units?.[0]?.items;
          if (pu0 && Array.isArray(pu0)) {
            existItems = pu0.map((item: any) => ({
              name: item.name,
              price: parseFloat(item.unit_amount?.value || '0'),
              quantity: parseInt(item.quantity || '1', 10),
              slug: item.sku || undefined,
            }));
          }
          if (existingData.payer) {
            existPayerEmail = existingData.payer.email_address || contact.email || '';
            const nm = existingData.payer.name;
            if (nm) existPayerName = [nm.given_name, nm.surname].filter(Boolean).join(' ');
          }
        } catch {}
        // Idempotent order persistence: the store dedupes by PayPal order id, so
        // this never creates a duplicate. It also heals a record whose first write
        // failed (or backfills attribution supplied on a repeat callback). Capture
        // and emails are NOT repeated in this branch — untouched from the fix.
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
          payerName: existPayerName || contact.name || '',
          items: existItems,
          persisted: backfill?.result?.persisted === true,
        });
      }
    } catch (e) {
      // If the pre-check fails for any reason, proceed to capture normally.
      console.error('Order pre-check error:', e);
    }

    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const captureData = await captureResponse.json();

    if (captureData.status === 'COMPLETED') {
      // Send order confirmation email (fire-and-forget, don't block response)
      try {
        const { sendEmail } = await import('@/lib/smtp');
        const SMTP_PASS = process.env.SMTP_PASS;
        if (SMTP_PASS) {
          let captureEmail = '';
          let captureName = '';
          let captureAmount = 0;
          try {
            const cap = captureData.purchase_units?.[0]?.payments?.captures?.[0];
            if (cap?.amount) captureAmount = parseFloat(cap.amount.value) || 0;
            if (captureData.payer) {
              captureEmail = captureData.payer.email_address || '';
              const pn = captureData.payer.name;
              if (pn) captureName = [pn.given_name, pn.surname].filter(Boolean).join(' ');
            }
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
                <ul><li>📦 We'll prepare your order within 1-2 business days</li><li>🚚 Standard shipping takes 5-8 business days</li><li>📧 You'll receive a tracking number via email</li></ul>
                <p style="color:#666;font-size:14px;margin-top:24px;">Questions? Reply to this email or contact support@freshlocksealer.com</p>
              </div></div>`;
            sendEmail({
              host: process.env.SMTP_HOST || 'smtp.zoho.com',
              port: Number(process.env.SMTP_PORT || 587),
              user: process.env.SMTP_USER || 'support@freshlocksealer.com',
              pass: SMTP_PASS,
              from: `FreshLock <${process.env.SMTP_USER || 'support@freshlocksealer.com'}>`,
              to: captureEmail,
              subject: `FreshLock Order Confirmed — ${captureData.id}`,
              html: emailHtml,
            }).catch((e: any) => console.error('Confirmation email error:', e));
          }
        }
      } catch (e) {
        console.error('Email send setup error:', e);
      }

      // ---- Merchant order notification (instant alert to the store owner) ----
      // Fires once per genuinely captured order (the idempotency guard above
      // returns early for duplicates, so this never double-sends).
      try {
        const { sendEmail: sendMerchantEmail } = await import('@/lib/smtp');
        const SMTP_PASS_M = process.env.SMTP_PASS;
        if (SMTP_PASS_M) {
          let mAmount = 0;
          let mName = ''; let mEmail = ''; let mPhone = '';
          let mAddr = ''; let mCapId = '';
          try {
            const puM: any = captureData.purchase_units?.[0] || {};
            const capM = puM.payments?.captures?.[0];
            if (capM?.amount) mAmount = parseFloat(capM.amount.value) || 0;
            if (capM?.id) mCapId = capM.id;
            const custId: string = puM.custom_id || capM?.custom_id || '';
            if (custId.startsWith('phone:')) mPhone = custId.slice(6);
            if (captureData.payer) {
              mEmail = captureData.payer.email_address || '';
              const pn = captureData.payer.name;
              if (pn) mName = [pn.given_name, pn.surname].filter(Boolean).join(' ');
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
