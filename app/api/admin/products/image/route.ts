import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { writeStoreBase64, readStoreJson, writeStoreJson } from '@/lib/admin-gh';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = (body.slug || '').toString().trim();
  const dataUrl = (body.dataUrl || '').toString();
  const slot = body.slot === undefined || body.slot === null ? 'main' : String(body.slot); // 'main' 或数字索引
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const cur = (await readStoreJson('data/image-overrides.json'))?.data || {};
  const normalize = (e: any) => (typeof e === 'string' ? { image: e } : (e || {}));

  if (dataUrl === '' || dataUrl === null) {
    // 清除该槽位覆盖
    const entry = normalize(cur[slug]);
    if (slot === 'main') delete entry.image; else if (entry.images) delete entry.images[slot];
    if (!entry.image && (!entry.images || Object.keys(entry.images).length === 0)) delete cur[slug]; else cur[slug] = entry;
    await writeStoreJson('data/image-overrides.json', cur, `admin: image override cleared ${slug}[${slot}]`);
    return NextResponse.json({ ok: true, cleared: true });
  }

  if (!dataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'image dataUrl required' }, { status: 400 });
  }
  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s);
  if (!m) return NextResponse.json({ error: 'unsupported image type (png/jpg/webp)' }, { status: 400 });
  if (Math.floor(m[2].length * 3 / 4) > 3 * 1024 * 1024) {
    return NextResponse.json({ error: 'image too large (max 3MB)' }, { status: 400 });
  }
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const rel = `/images/products/admin-${slot === 'main' ? slug : slug + '-g' + slot}-${Date.now()}.${ext}`;
  await writeStoreBase64(`public${rel}`, m[2], `admin: product image ${slug} slot=${slot}`);

  const entry = normalize(cur[slug]);
  if (slot === 'main') entry.image = rel; else (entry.images = entry.images || {})[slot] = rel;
  cur[slug] = entry;
  await writeStoreJson('data/image-overrides.json', cur, `admin: image override ${slug}[${slot}]`);
  return NextResponse.json({ ok: true, image: rel, slot });
}
