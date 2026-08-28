import { NextRequest, NextResponse } from 'next/server';

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
            items: items.map((item: { name: string; price: number; quantity: number }) => ({
              name: item.name,
              unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2),
              },
              quantity: item.quantity.toString(),
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
    const { orderId } = await request.json();
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
        let existAmount = 0; let existPayerEmail = ''; let existPayerName = ''; let existItems: any[] = [];
        try {
          const cap0 = existingData.purchase_units?.[0]?.payments?.captures?.[0];
          if (cap0?.amount) existAmount = parseFloat(cap0.amount.value) || 0;
          const pu0 = existingData.purchase_units?.[0]?.items;
          if (pu0 && Array.isArray(pu0)) {
            existItems = pu0.map((item: any) => ({
              name: item.name,
              price: parseFloat(item.unit_amount?.value || '0'),
              quantity: parseInt(item.quantity || '1', 10),
            }));
          }
          if (existingData.payer) {
            existPayerEmail = existingData.payer.email_address || '';
            const nm = existingData.payer.name;
            if (nm) existPayerName = [nm.given_name, nm.surname].filter(Boolean).join(' ');
          }
        } catch {}
        return NextResponse.json({
          success: true,
          orderId: existingData.id,
          status: existingData.status,
          alreadyCaptured: true,
          amount: existAmount,
          currency: 'USD',
          payerEmail: existPayerEmail,
          payerName: existPayerName,
          items: existItems,
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
          payerEmail = captureData.payer.email_address || '';
          const name = captureData.payer.name;
          if (name) {
            payerName = [name.given_name, name.surname].filter(Boolean).join(' ');
          }
        }
      } catch (e) {
        console.error('Error parsing capture data:', e);
      }

      return NextResponse.json({
        success: true,
        orderId: captureData.id,
        status: captureData.status,
        amount: amount,
        currency: currency,
        payerEmail: payerEmail,
        payerName: payerName,
        items: orderItems,
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
