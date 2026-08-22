import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SITE_URL = 'https://www.freshlocksealer.com'
const WWW_HOST = 'www.freshlocksealer.com'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get('host') || ''
  
  // Redirect non-www to www
  if (host === 'freshlocksealer.com') {
    return NextResponse.redirect(`${SITE_URL}${url.pathname}`, 301)
  }
  
  // Skip static assets
  if (url.pathname.startsWith('/_next') || 
      url.pathname.includes('.') ||
      url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Set canonical header
  const path = url.pathname === '/' ? '' : url.pathname
  const canonical = `${SITE_URL}${path}`
  const response = NextResponse.next()
  response.headers.set('x-canonical-url', canonical)

  // Noindex utility pages (checkout, cart, success)
  if (url.pathname.startsWith('/checkout') || url.pathname.startsWith('/cart')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|favicon|images|logo|api).*)'],
}
