import { NextRequest, NextResponse } from 'next/server';

const JP_BASE = 'https://jp.freshlocksealer.com';
const SHARED_EXACT = new Set(['/', '/contact', '/shipping', '/returns', '/faq', '/about', '/privacy', '/terms', '/cart']);
const SHARED_PRODUCTS = new Set(['/products/freshlock-pro', '/products/freshlock-starter-kit', '/products/vacuum-seal-bags-30-pack', '/products/vacuum-seal-bags-50-pack']);

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  const jaPath = SHARED_EXACT.has(path) || SHARED_PRODUCTS.has(path) ? path : null;
  const self = `https://www.freshlocksealer.com${path}`;
  const links = [`<${self}>; rel="alternate"; hreflang="en"`, `<${self}>; rel="alternate"; hreflang="x-default"`];
  if (jaPath) links.push(`<${JP_BASE}${jaPath}>; rel="alternate"; hreflang="ja"`);
  res.headers.set('Link', links.join(', '));

  // 恢复 96ee69a 版 middleware 的 canonical 响应头（6fbf8f1 重写时丢失）
  const canonical = `https://www.freshlocksealer.com${path === '/' ? '' : path}`;
  res.headers.set('x-canonical-url', canonical);

  if (req.headers.get('x-vercel-ip-country') === 'JP') {
    res.cookies.set('jp_visitor', '1', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
  }
  return res;
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|llms.txt|google-shopping-feed.xml).*)'],
};
