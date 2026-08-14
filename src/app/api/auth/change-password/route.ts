import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { validateNewPassword } from '@/lib/auth/password-policy'

function safeDestination(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/workspace'
  return value
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const next = safeDestination(formData.get('next'))

  if (password !== confirmPassword) {
    return NextResponse.redirect(new URL(`/account/change-password?error=mismatch&next=${encodeURIComponent(next)}`, request.url), 303)
  }

  const policy = validateNewPassword(password)
  if (!policy.valid) {
    const url = new URL('/account/change-password', request.url)
    url.searchParams.set('error', 'weak_password')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, 303)
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.id) {
    return NextResponse.redirect(new URL('/login?error=unauthenticated', request.url), 303)
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password })
  if (passwordError) {
    const url = new URL('/account/change-password', request.url)
    url.searchParams.set('error', 'password_update_failed')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, 303)
  }

  const admin = createSupabaseAdminClient()
  const changedAt = new Date().toISOString()
  const appMetadata = {
    ...(user.app_metadata ?? {}),
    must_change_password: false,
    password_changed_at: changedAt,
  }
  const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, { app_metadata: appMetadata })
  if (metadataError) {
    const url = new URL('/account/change-password', request.url)
    url.searchParams.set('error', 'password_flag_clear_failed')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, 303)
  }

  await admin.from('core_access_control_events').insert({
    actor_user_id: user.id,
    target_user_id: user.id,
    action: 'password_changed',
    reason: 'Mandatory first-login or administrator-required password change completed.',
    after_state: { password_changed_at: changedAt },
  })

  return NextResponse.redirect(new URL(next, request.url), 303)
}
