import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { readStoreJson, writeStoreJson } from '@/lib/admin-gh';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Coupon = { code: string; percentOff?: number; amountOff?: number; minSubtotal?: number; active: boolean; notBefore?: string; notAfter?: string; description: string };

export async function POST(request: Request) {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const action = (body.action || '').toString();
  const cur = ((await readStoreJson('data/coupons.json'))?.data || []) as Coupon[];

  if (action === 'toggle') {
    const idx = Number(body.index);
    if (!Number.isInteger(idx) || !cur[idx]) return NextResponse.json({ error: 'bad index' }, { status: 400 });
    cur[idx].active = !cur[idx].active;
  } else if (action === 'create') {
    const code = (body.code || '').toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const percentOff = body.percentOff === '' || body.percentOff == null ? undefined : Number(body.percentOff);
    const amountOff = body.amountOff === '' || body.amountOff == null ? undefined : Number(body.amountOff);
    if (!/^[A-Z0-9]{3,24}$/.test(code)) return NextResponse.json({ error: 'code must be 3-24 letters/digits' }, { status: 400 });
    if (cur.some(c => c.code === code)) return NextResponse.json({ error: 'code already exists' }, { status: 400 });
    if (percentOff != null && !(percentOff > 0 && percentOff < 1)) return NextResponse.json({ error: 'percent must be 0-1 (e.g. 0.15 = 15%)' }, { status: 400 });
    if (amountOff != null && !(amountOff > 0 && amountOff < 10000)) return NextResponse.json({ error: 'amount must be 1-9999' }, { status: 400 });
    if (percentOff == null && amountOff == null) return NextResponse.json({ error: 'set percentOff or amountOff' }, { status: 400 });
    cur.push({
      code,
      ...(percentOff != null ? { percentOff } : {}),
      ...(amountOff != null ? { amountOff } : {}),
      ...(body.minSubtotal ? { minSubtotal: Number(body.minSubtotal) } : {}),
      ...(body.notBefore ? { notBefore: String(body.notBefore) } : {}),
      ...(body.notAfter ? { notAfter: String(body.notAfter) } : {}),
      active: true,
      description: (body.description || '').toString().slice(0, 120) || 'admin created',
    });
  } else {
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  }

  await writeStoreJson('data/coupons.json', cur, `admin: coupon ${action}`);
  return NextResponse.json({ ok: true, coupons: cur });
}
