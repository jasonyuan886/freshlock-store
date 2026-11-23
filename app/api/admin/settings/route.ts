import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import { readOrdersJson, writeOrdersJson } from '@/lib/admin-gh';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const r = await readOrdersJson('site-settings.json');
  return NextResponse.json(r?.data || { holidayMode: { enabled: false, title: '', message: '' } });
}

export async function POST(request: Request) {
  if (!isValidSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const next = {
    holidayMode: {
      enabled: !!body?.holidayMode?.enabled,
      title: (body?.holidayMode?.title || '').toString().slice(0, 80),
      message: (body?.holidayMode?.message || '').toString().slice(0, 200),
    },
  };
  await writeOrdersJson('site-settings.json', next, 'admin: site settings update');
  return NextResponse.json({ ok: true, settings: next });
}
