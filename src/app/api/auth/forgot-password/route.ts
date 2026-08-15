import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function redirectToRecovery(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/auth/forgot-password', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url, 303)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) return redirectToRecovery(request, { error: 'invalid_email' })

  const supabase = await createSupabaseServerClient()
  const redirectTo = new URL('/auth/callback?next=/auth/update-password', request.url).toString()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) {
    console.error('password recovery request failed', { code: error.code, status: error.status })
  }

  return redirectToRecovery(request, { sent: '1' })
}
