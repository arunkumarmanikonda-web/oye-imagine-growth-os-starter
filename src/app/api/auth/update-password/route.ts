import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateNewPassword } from '@/lib/auth/password-policy'

function updateRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/auth/update-password', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url, 303)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login?error=identity_verification_failed', request.url), 303)

  const formData = await request.formData()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  if (password !== confirmPassword || !validateNewPassword(password).valid) {
    return updateRedirect(request, { error: 'invalid_password' })
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return updateRedirect(request, { error: 'update_failed' })

  return updateRedirect(request, { success: '1' })
}
