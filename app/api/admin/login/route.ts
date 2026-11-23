import { NextResponse } from 'next/server';
import { createSessionValue, ADMIN_COOKIE } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 简易防爆破：每 IP 15 分钟内最多 8 次
const attempts = new Map<string, { n: number; t: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const rec = attempts.get(ip) || { n: 0, t: 0 };
  if (now - rec.t > 15 * 60 * 1000) rec.n = 0;
  if (rec.n >= 8) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  rec.n += 1; rec.t = now; attempts.set(ip, rec);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const password = (body.password || '').toString();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600,
  });
  return res;
}
