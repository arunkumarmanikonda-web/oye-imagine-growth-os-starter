import { NextRequest, NextResponse } from 'next/server'
import { getClearedAuthCookieKeys } from '@/lib/auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY } from '@/lib/recovery/workspace-foundation'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url))

  for (const cookieKey of [...getClearedAuthCookieKeys(), ACTIVE_WORKSPACE_COOKIE_KEY]) {
    response.cookies.set(cookieKey, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }

  return response
}
