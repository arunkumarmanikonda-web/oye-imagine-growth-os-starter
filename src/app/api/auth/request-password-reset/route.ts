import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function redirect(request: NextRequest, key: 'status' | 'error', value: string) {
  const url = new URL('/forgot-password', request.url)
  url.searchParams.set(key, value)
  return NextResponse.redirect(url, 303)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) return redirect(request, 'error', 'invalid_email')

  const supabase = await createSupabaseServerClient()
  const recoveryUrl = new URL('/auth/recovery', request.nextUrl.origin).toString()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: recoveryUrl })

  // Deliberately avoid revealing whether an account exists for the supplied email.
  // Provider or SMTP failures are surfaced only as a generic availability error.
  if (error && !/user|email|not found/i.test(error.message)) return redirect(request, 'error', 'unavailable')
  return redirect(request, 'status', 'sent')
}
