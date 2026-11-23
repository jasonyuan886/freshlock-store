import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { finalizeAirwallexOrder } from '@/lib/airwallex-finalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function verifyAirwallexSignature(rawBody: string, timestamp: string, signature: string, secret: string): boolean {
  // Airwallex signs: HMAC-SHA256(secret, timestamp + rawBody).
  // Accept both common concatenation forms to stay robust across doc versions.
  const candidates = [`${timestamp}.${rawBody}`, `${timestamp}${rawBody}`];
  for (const payload of candidates) {
    const expected = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
    if (timingSafeEqualHex(expected, signature)) return true;
  }
  return false;
}

function headerMatchesSecret(request: Request, secret: string): boolean {
  // Airwallex console guidance for webhook secrets: "Check the secret in the
  // request header matches this secret." Some integrations deliver the shared
  // secret in a dedicated header — accept an exact match on any header value.
  const headers = (request.headers as any)?.entries?.();
  if (!headers) return false;
  for (const [, value] of request.headers.entries()) {
    if (value === secret) return true;
  }
  return false;
}

export async function POST(request: Request) {
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;
  if (!secret) {
    console.error('airwallex webhook: AIRWALLEX_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const timestamp = request.headers.get('x-timestamp') || '';
  const signature = request.headers.get('x-signature') || '';

  if (!timestamp || !signature) {
    return NextResponse.json({ error: 'missing signature headers' }, { status: 400 });
  }

  // Replay protection: reject events older than 5 minutes
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'stale timestamp' }, { status: 400 });
  }

  const verified =
    headerMatchesSecret(request, secret) ||
    verifyAirwallexSignature(rawBody, timestamp, signature, secret);
  if (!verified) {
    console.error('airwallex webhook: signature mismatch');
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const eventName: string = event?.name || '';
  const intentId: string = event?.data?.object?.id || '';

  if (eventName === 'payment_intent.succeeded' && intentId) {
    try {
      await finalizeAirwallexOrder(intentId);
    } catch (err) {
      console.error('airwallex webhook finalize error:', err);
      return NextResponse.json({ error: 'finalize failed' }, { status: 500 });
    }
  } else {
    console.log('airwallex webhook ignored event:', eventName || 'unknown');
  }

  return NextResponse.json({ received: true });
}
