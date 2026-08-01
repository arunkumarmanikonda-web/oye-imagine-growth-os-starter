import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildRecoveryAuthSessionFromCookieStore } from '@/lib/recovery/auth-session-server'

export async function GET() {
  const cookieStore = await cookies()
  const session = buildRecoveryAuthSessionFromCookieStore(cookieStore)

  return NextResponse.json({
    session,
  })
}