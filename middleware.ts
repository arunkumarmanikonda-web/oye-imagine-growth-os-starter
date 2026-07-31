import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_COOKIE_KEYS,
  getLoginRedirect,
  hasSupabaseSessionCookie,
  resolveAccessRoleFromCookies,
  shouldProtectPath,
  shouldRedirectForRole,
} from '@/lib/recovery/auth-foundation'

export function middleware(request: NextRequest) {
  if (process.env.ENABLE_BATCH_A_ROUTE_GUARDS !== 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  if (!shouldProtectPath(pathname)) {
    return NextResponse.next()
  }

  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name)
  const supabaseLikeSession = hasSupabaseSessionCookie(cookieNames)

  const role = resolveAccessRoleFromCookies({
    [ACCESS_COOKIE_KEYS.role]: request.cookies.get(ACCESS_COOKIE_KEYS.role)?.value,
    [ACCESS_COOKIE_KEYS.authReady]: supabaseLikeSession
      ? 'true'
      : request.cookies.get(ACCESS_COOKIE_KEYS.authReady)?.value,
  })

  if (shouldRedirectForRole(pathname, role)) {
    const redirectUrl = new URL(getLoginRedirect(pathname), request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*'],
}