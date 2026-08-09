import { NextRequest, NextResponse } from 'next/server'
import { getClearedAuthCookieKeys } from '@/lib/auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY } from '@/lib/recovery/workspace-foundation'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url))

  const keysToClear = Array.from(
    new Set([
      ...getClearedAuthCookieKeys(),
      ACTIVE_WORKSPACE_COOKIE_KEY,
      RECOVERY_AUTH_COOKIE_KEYS.sessionId,
      RECOVERY_AUTH_COOKIE_KEYS.role,
      RECOVERY_AUTH_COOKIE_KEYS.email,
      RECOVERY_AUTH_COOKIE_KEYS.displayName,
    ]),
  )

  for (const cookieKey of keysToClear) {
    response.cookies.set(cookieKey, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }

  return response
}