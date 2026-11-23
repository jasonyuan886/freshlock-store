import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { readStoreJson, writeStoreJson } from '@/lib/admin-gh';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNum(v: any): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function POST(request: Request) {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = (body.slug || '').toString().trim();
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const price = toNum(body.price);
  const cap = toNum(body.compareAtPrice);
  if (price === undefined || cap === undefined) {
    return NextResponse.json({ error: 'bad number' }, { status: 400 });
  }
  if (price !== null && (price < 0.5 || price > 10000)) {
    return NextResponse.json({ error: 'price must be 0.5-10000 or empty' }, { status: 400 });
  }
  if (cap !== null && (cap < 0.5 || cap > 10000)) {
    return NextResponse.json({ error: 'compareAtPrice must be 0.5-10000 or empty' }, { status: 400 });
  }
  const cur = (await readStoreJson('data/price-overrides.json'))?.data || {};
  if (price === null && cap === null) {
    delete cur[slug];
  } else {
    const entry: any = {};
    if (price !== null) entry.price = Math.round(price * 100) / 100;
    if (cap !== null) entry.compareAtPrice = Math.round(cap * 100) / 100;
    cur[slug] = entry;
  }
  await writeStoreJson('data/price-overrides.json', cur, `admin: price override ${slug}`);
  return NextResponse.json({ ok: true, overrides: cur });
}
