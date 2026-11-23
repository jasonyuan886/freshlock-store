import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { readStoreJson, writeStoreJson } from '@/lib/admin-gh';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = (body.slug || '').toString().trim();
  const price = body.price === null || body.price === '' ? null : Number(body.price);
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  if (price !== null && (!Number.isFinite(price) || price < 0.5 || price > 10000)) {
    return NextResponse.json({ error: 'price must be 0.5-10000 or null' }, { status: 400 });
  }
  const cur = (await readStoreJson('data/price-overrides.json'))?.data || {};
  if (price === null) delete cur[slug]; else cur[slug] = Math.round(price * 100) / 100;
  await writeStoreJson('data/price-overrides.json', cur, `admin: price override ${slug} = ${price}`);
  return NextResponse.json({ ok: true, overrides: cur });
}
