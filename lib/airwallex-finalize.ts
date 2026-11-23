// Shared finalize logic: server-verifies an Airwallex payment intent and,
// if captured, marks the order PAID and sends the confirmation email.
// Used by BOTH the webhook (authoritative) and the client-side success path
// (fallback until the webhook is configured). Fully idempotent.

import {
  getAirwallexPaymentIntent,
  loadAirwallexOrder,
  saveAirwallexOrder,
  type AirwallexOrderRecord,
} from '@/lib/airwallex';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'support@freshlocksealer.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || 'support@freshlocksealer.com';
const SMTP_PASS = process.env.SMTP_PASS;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function money(n: number): string {
  return `$${Number(n || 0).toFixed(2)}`;
}

function buildConfirmationEmail(record: AirwallexOrderRecord): { html: string; text: string } {
  const rows = record.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(it.name)} × ${it.quantity}</td>` +
        `<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${money(it.price * it.quantity)}</td></tr>`,
    )
    .join('');
  const sa = record.shipping_address;
  const shipLines = [sa.address, sa.city, sa.state, sa.postal_code, sa.country].filter(Boolean).join(', ');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#222;">
      <h2 style="color:#0f4c3a;border-bottom:2px solid #0f4c3a;padding-bottom:8px;">Thank you for your order!</h2>
      <p>Hi ${escapeHtml(record.customer.first_name || 'there')}, your payment was received. Your order is being prepared.</p>
      <p><strong>Order:</strong> ${escapeHtml(record.order_number)}<br/>
         <strong>Date:</strong> ${escapeHtml(new Date(record.created_at).toLocaleString('en-US'))}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        ${rows}
        <tr><td style="padding:6px 8px;">Subtotal</td><td style="padding:6px 8px;text-align:right;">${money(record.subtotal)}</td></tr>
        <tr><td style="padding:6px 8px;">Shipping</td><td style="padding:6px 8px;text-align:right;">${record.shipping === 0 ? 'FREE' : money(record.shipping)}</td></tr>
        ${record.discount ? `<tr><td style="padding:6px 8px;">Discount${record.coupon_code ? ` (${escapeHtml(record.coupon_code)})` : ''}</td><td style="padding:6px 8px;text-align:right;">-${money(record.discount)}</td></tr>` : ''}
        <tr><td style="padding:8px;font-weight:bold;border-top:2px solid #0f4c3a;">Total</td><td style="padding:8px;font-weight:bold;text-align:right;border-top:2px solid #0f4c3a;">${money(record.total)}</td></tr>
      </table>
      ${shipLines ? `<p><strong>Shipping to:</strong><br/>${escapeHtml(shipLines)}</p>` : ''}
      <p style="color:#888;font-size:12px;">Questions? Just reply to this email — we read every message.<br/>FreshLock · support@freshlocksealer.com</p>
    </div>`;

  const text = [
    'Thank you for your FreshLock order!',
    '',
    `Order: ${record.order_number}`,
    `Date: ${record.created_at}`,
    '',
    ...record.items.map((it) => `${it.name} x${it.quantity} - ${money(it.price * it.quantity)}`),
    `Subtotal: ${money(record.subtotal)}`,
    `Shipping: ${record.shipping === 0 ? 'FREE' : money(record.shipping)}`,
    ...(record.discount ? [`Discount: -${money(record.discount)}`] : []),
    `Total: ${money(record.total)}`,
    '',
    shipLines ? `Shipping to: ${shipLines}` : '',
    '',
    'Questions? Reply to this email.',
  ].join('\n');

  return { html, text };
}

export type FinalizeResult = {
  paid: boolean;
  orderNumber?: string;
  orderId?: string;
  customerEmail?: string;
  confirmationEmailStatus?: 'sent' | 'failed' | 'skipped';
  totalCents?: number;
};

export async function finalizeAirwallexOrder(intentId: string): Promise<FinalizeResult> {
  // 1. Authoritative check with Airwallex (never trust client/webhook alone)
  const intent = await getAirwallexPaymentIntent(intentId);
  if (intent.status !== 'SUCCEEDED') {
    return { paid: false, orderId: intent.id };
  }

  const orderNumber = intent.merchantOrderId || '';
  if (!orderNumber) {
    console.error('finalizeAirwallexOrder: intent missing merchant_order_id', intent.id);
    return { paid: true, orderId: intent.id };
  }

  // 2. Load order record; if missing, alert ops (funds captured but no record)
  let record: AirwallexOrderRecord | null = null;
  try {
    record = await loadAirwallexOrder(orderNumber);
  } catch (err) {
    console.error('finalizeAirwallexOrder: load record failed', err);
  }
  if (!record) {
    console.error('finalizeAirwallexOrder: order record not found for', orderNumber);
    try {
      const { sendEmail } = await import('@/lib/smtp');
      if (SMTP_PASS) {
        await sendEmail({
          host: SMTP_HOST,
          port: SMTP_PORT,
          user: SMTP_USER,
          pass: SMTP_PASS,
          from: `FreshLock Website <${SMTP_USER}>`,
          to: TO_EMAIL,
          subject: `[ALERT] Airwallex payment captured but order record missing: ${orderNumber}`,
          html: `<p>Intent ${escapeHtml(intent.id)} succeeded for ${escapeHtml(orderNumber)} but no order file exists. Investigate in Airwallex dashboard.</p>`,
          text: `Intent ${intent.id} succeeded for ${orderNumber} but no order file exists.`,
        });
      }
    } catch (e) {
      console.error('finalizeAirwallexOrder: alert email failed', e);
    }
    return { paid: true, orderNumber, orderId: intent.id };
  }

  // 3. Idempotency: already finalized
  if (record.status === 'PAID') {
    return {
      paid: true,
      orderNumber,
      orderId: intent.id,
      customerEmail: record.customer.email,
      confirmationEmailStatus: record.confirmation_email_status || 'sent',
    };
  }

  // 4. Mark paid and persist
  record.status = 'PAID';
  record.paid_at = new Date().toISOString();
  record.confirmation_email_status = 'skipped';

  // 5. Confirmation email
  try {
    const { sendEmail } = await import('@/lib/smtp');
    if (!SMTP_PASS) throw new Error('SMTP_PASS missing');
    const { html, text } = buildConfirmationEmail(record);
    await sendEmail({
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      pass: SMTP_PASS,
      from: `FreshLock <${SMTP_USER}>`,
      to: record.customer.email,
      subject: `Your FreshLock order confirmation (#${record.order_number})`,
      html,
      text,
      replyTo: SMTP_USER,
    });
    record.confirmation_email_status = 'sent';
  } catch (err) {
    console.error('finalizeAirwallexOrder: confirmation email failed', err);
    record.confirmation_email_status = 'failed';
  }

  try {
    await saveAirwallexOrder(record);
  } catch (err) {
    console.error('finalizeAirwallexOrder: save failed', err);
  }

  // 6. GA4 server-side purchase (best effort)
  try {
    const { sendServerPurchaseEvent } = await import('@/lib/ga4-server');
    await sendServerPurchaseEvent({
      orderId: record.order_number,
      value: record.total,
      currency: record.currency,
      items: record.items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price })),
      attribution: record.attribution,
    });
  } catch {
    // GA4 is non-critical
  }

  return {
    paid: true,
    orderNumber,
    orderId: intent.id,
    customerEmail: record.customer.email,
    confirmationEmailStatus: record.confirmation_email_status,
    totalCents: Math.round(record.total * 100),
  };
}
