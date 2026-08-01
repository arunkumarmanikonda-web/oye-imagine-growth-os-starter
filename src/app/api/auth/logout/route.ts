import { NextRequest, NextResponse } from 'next/server'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url))

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.sessionId, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.role, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.email, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.displayName, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.activeWorkspaceId, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}