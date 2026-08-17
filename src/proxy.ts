import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_AUTH_PATHS = new Set(['/login', '/signup'])

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/login/admin' || pathname === '/login/client') {
    const canonical = request.nextUrl.clone()
    canonical.pathname = '/login'
    canonical.search = ''
    const response = NextResponse.redirect(canonical)
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  // Authentication entry points must stay publicly reachable. Session refresh and
  // membership enforcement belong on protected application routes, not on the
  // pages a signed-out user needs in order to authenticate.
  if (PUBLIC_AUTH_PATHS.has(pathname)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/workspace/:path*',
    '/admin/:path*',
    '/client/:path*',
    '/api/admin/:path*',
    '/api/client/:path*',
    '/onboarding/activation/:path*',
    '/account/change-password',
    '/auth/mfa',
    '/login',
    '/login/admin',
    '/login/client',
    '/signup/:path*',
  ],
}
