import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function invalidRecovery(request: NextRequest) {
  return NextResponse.redirect(new URL('/auth/forgot-password?error=invalid_or_expired', request.url), 303)
}

function validTokenHash(value: string) {
  return /^[a-f0-9]{40,128}$/i.test(value)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const tokenHash = String(formData.get('token_hash') ?? '').trim()
  if (!validTokenHash(tokenHash)) return invalidRecovery(request)

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
  if (error) {
    console.error('password recovery verification failed', { code: error.code, status: error.status })
    return invalidRecovery(request)
  }

  return NextResponse.redirect(new URL('/auth/update-password', request.url), 303)
}
