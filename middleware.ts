import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SITE_URL = 'https://www.freshlocksealer.com'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Only process HTML page requests (not static assets)
  if (url.pathname.startsWith('/_next') || 
      url.pathname.includes('.') ||
      url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Calculate canonical
  const path = url.pathname === '/' ? '' : url.pathname
  const canonical = `${SITE_URL}${path}`

  // Get the response
  const response = NextResponse.next()
  
  // Add debug header
  response.headers.set('x-canonical-url', canonical)
  response.headers.set('x-middleware-ran', 'true')

  // We'll inject canonical via a different method:
  // Set a response header that the client can read
  // But also try to modify the HTML body
  
  return response
}

export const config = {
  matcher: ['/((?!_next|favicon|images|logo|api).*)'],
}
