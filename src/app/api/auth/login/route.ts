import { NextRequest, NextResponse } from 'next/server'
import { createRecoverySessionPayload } from '@/lib/recovery/auth-session'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const displayName = String(formData.get('displayName') ?? '').trim()

  if (!email || !role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = createRecoverySessionPayload({
    email,
    role,
    displayName,
  })

  const destination = payload.role === 'operator' ? '/admin' : '/client'
  const response = NextResponse.redirect(new URL(destination, request.url))

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.sessionId, payload.sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.role, payload.role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.email, payload.email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.displayName, payload.displayName, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}