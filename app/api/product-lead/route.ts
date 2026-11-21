import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/smtp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || 'support@freshlocksealer.com';
const SMTP_PASS = process.env.SMTP_PASS;
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'support@freshlocksealer.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
  try {
    if (!SMTP_PASS) {
      console.error('SMTP_PASS env var not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const email: string = (body.email || '').toString().trim();
    const product: string = (body.product || '').toString().trim().slice(0, 120);
    const slug: string = (body.slug || '').toString().trim().slice(0, 120);
    const honeypot: string = (body.website || '').toString().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Honeypot: bots fill hidden fields. Pretend success but do nothing.
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const pageUrl = `https://www.freshlocksealer.com/products/${slug || ''}`;
    const productLabel = product || 'Unknown product';

    const notifyHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; color: #222;">
        <h2 style="color:#0f4c3a; border-bottom:2px solid #0f4c3a; padding-bottom:8px;">New Product Page Lead</h2>
        <p>A visitor left their email on a product page (interested but did not order):</p>
        <p style="font-size:18px; font-weight:bold;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Product:</strong> ${escapeHtml(productLabel)}</p>
        <p><strong>Page:</strong> <a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>
        <p style="color:#888; font-size:12px;">Source: Product page email capture on www.freshlocksealer.com</p>
      </div>
    `;

    const notifyText = [
      'New Product Page Lead',
      '',
      `Email: ${email}`,
      `Product: ${productLabel}`,
      `Page: ${pageUrl}`,
      '',
      'Source: Product page email capture on www.freshlocksealer.com',
    ].join('\n');

    await sendEmail({
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      pass: SMTP_PASS,
      from: `FreshLock Website <${SMTP_USER}>`,
      to: TO_EMAIL,
      subject: `[FreshLock] Product page lead: ${email}`,
      html: notifyHtml,
      text: notifyText,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('product-lead error:', err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
