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
  if (!slug || !dataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'slug + image dataUrl required' }, { status: 400 });
  }
  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s);
  if (!m) return NextResponse.json({ error: 'unsupported image type (png/jpg/webp)' }, { status: 400 });
  const b64 = m[2];
  const approxBytes = Math.floor(b64.length * 3 / 4);
  if (approxBytes > 3 * 1024 * 1024) {
    return NextResponse.json({ error: 'image too large (max 3MB)' }, { status: 400 });
  }
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const rel = `/images/products/admin-${slug}-${Date.now()}.${ext}`;
  await writeStoreBase64(`public${rel}`, b64, `admin: product image ${slug}`);

  const cur = (await readStoreJson('data/image-overrides.json'))?.data || {};
  cur[slug] = rel;
  await writeStoreJson('data/image-overrides.json', cur, `admin: image override ${slug}`);

  return NextResponse.json({ ok: true, image: rel });
}
