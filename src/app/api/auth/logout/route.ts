import { NextRequest, NextResponse } from 'next/server'
import { getClearedAuthCookieKeys } from '@/lib/auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY } from '@/lib/recovery/workspace-foundation'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (claimsData?.claims) {
    await supabase.auth.signOut()
  }

  const response = NextResponse.redirect(new URL('/login', request.url))
  response.headers.set('Cache-Control', 'private, no-store')

  const keysToClear = Array.from(
    new Set([
      ...getClearedAuthCookieKeys(),
      ACTIVE_WORKSPACE_COOKIE_KEY,
      ...Object.values(RECOVERY_AUTH_COOKIE_KEYS),
      'oye_session_state',
      'oye_workspace_id',
      'oye_active_role',
    ]),
  )

  for (const cookieKey of keysToClear) {
    response.cookies.set(cookieKey, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }

  return response
}
