import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const ALLOWED_STAGES = new Set(['card-fields-error', 'card-submit-error']);

function cleanIssue(value: unknown): string {
  if (typeof value !== 'string') return 'UNKNOWN';
  return value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 80) || 'UNKNOWN';
}

function cleanDebugId(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 128);
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > 4096) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const stage = typeof body.stage === 'string' ? body.stage : '';
  if (!ALLOWED_STAGES.has(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const issue = cleanIssue(body.issue);
  const debugId = cleanDebugId(body.debugId);
  const reference = `CARD-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Never log the request body, customer contact details, card data or raw SDK errors.
  console.error(
    `[PayPal Card] reference=${reference} stage=${stage} issue=${issue} debugId=${debugId || 'none'}`,
  );
  return NextResponse.json({ reference });
}
