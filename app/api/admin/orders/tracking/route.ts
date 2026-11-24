import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { readOrdersText, writeOrdersText } from '@/lib/admin-gh';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || 'support@freshlocksealer.com';
const SMTP_PASS = process.env.SMTP_PASS;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const id = (body.id || '').toString().trim();
  const tracking = (body.tracking || '').toString().trim().slice(0, 60);
  if (!id || !/^[a-zA-Z0-9\-_.]+$/.test(id)) {
    return NextResponse.json({ error: 'bad id' }, { status: 400 });
  }
  if (!tracking) {
    return NextResponse.json({ error: 'tracking required' }, { status: 400 });
  }
  const path = `orders/${id}.json`;
  const existing = await readOrdersText(path);
  if (!existing) return NextResponse.json({ error: 'order not found' }, { status: 404 });
  let rec: any;
  try { rec = JSON.parse(existing.text); } catch {
    return NextResponse.json({ error: 'order unreadable' }, { status: 500 });
  }
  if (rec.tracking_no === tracking) {
    return NextResponse.json({ ok: true, skipped: true, message: '单号未变化，不重复发信' });
  }
  rec.tracking_no = tracking;
  rec.shipped_at = new Date().toISOString();
  await writeOrdersText(path, JSON.stringify(rec, null, 2), `admin: tracking ${id} = ${tracking}`, existing.sha);

  // 给客户发追踪信（JP 单发日文，其余英文）
  const email: string = (rec.customer?.email || rec.customer_email || '').toString();
  let emailStatus = 'no_customer_email';
  if (email && SMTP_PASS) {
    const isJp = rec.source === 'airwallexjp' || id.startsWith('airwallexjp-');
    const orderNum = rec.order_number || rec.order_id || id;
    const trackUrl = `https://t.17track.net/en#nums=${encodeURIComponent(tracking)}`;
    try {
      const { sendEmail } = await import('@/lib/smtp');
      if (isJp) {
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
          <h2 style="color:#0f4c3a;">ご注文を発送いたしました 🚚</h2>
          <p>注文番号: <strong>${esc(orderNum)}</strong></p>
          <p>追跡番号: <strong style="font-size:18px;">${esc(tracking)}</strong></p>
          <p><a href="${trackUrl}" style="background:#0f4c3a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;display:inline-block;">荷物を追跡する</a></p>
          <p style="color:#888;font-size:13px;">追跡情報は発送から24～48時間後に反映されます。ご質問はこのメールにご返信ください。</p>
          <p>FreshLock JP ・ support@freshlocksealer.com</p></div>`;
        await sendEmail({
          host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS,
          from: `FreshLock JP <${SMTP_USER}>`, to: email,
          subject: `ご注文を発送いたしました（${orderNum}）`,
          html, text: `ご注文を発送いたしました。注文番号: ${orderNum} / 追跡番号: ${tracking} / 追跡: ${trackUrl}`,
          replyTo: SMTP_USER,
        });
      } else {
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
          <h2 style="color:#0f4c3a;">Your order has shipped 🚚</h2>
          <p>Order: <strong>${esc(orderNum)}</strong></p>
          <p>Tracking number: <strong style="font-size:18px;">${esc(tracking)}</strong></p>
          <p><a href="${trackUrl}" style="background:#0f4c3a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Track your package</a></p>
          <p style="color:#888;font-size:13px;">Tracking info usually activates within 24–48 hours of dispatch. Questions? Just reply to this email.</p>
          <p>FreshLock ・ support@freshlocksealer.com</p></div>`;
        await sendEmail({
          host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS,
          from: `FreshLock <${SMTP_USER}>`, to: email,
          subject: `Your FreshLock order has shipped (#${orderNum})`,
          html, text: `Your order has shipped. Order: ${orderNum} / Tracking: ${tracking} / Track: ${trackUrl}`,
          replyTo: SMTP_USER,
        });
      }
      emailStatus = 'sent';
    } catch (e) {
      emailStatus = 'failed';
    }
  }
  return NextResponse.json({ ok: true, tracking, email: emailStatus });
}
