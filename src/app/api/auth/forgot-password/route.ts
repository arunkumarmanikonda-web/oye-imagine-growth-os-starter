import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordRecoveryEmail } from '@/lib/auth/recovery-email'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function redirectToRecovery(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/auth/forgot-password', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url, 303)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) return redirectToRecovery(request, { error: 'invalid_email' })

  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: 'https://www.oyeimagine.com/auth/update-password' },
    })

    if (error || !data?.properties?.hashed_token) {
      console.error('password recovery link generation failed', {
        code: error?.code || 'recovery_link_unavailable',
        status: error?.status,
      })
    } else {
      await sendPasswordRecoveryEmail({ email, tokenHash: data.properties.hashed_token })
    }
  } catch (error) {
    const code = error instanceof Error ? error.message.split(':')[0] : 'password_recovery_failed'
    console.error('password recovery request failed', { code })
  }

  // Always return the same public result so the endpoint does not disclose account existence.
  return redirectToRecovery(request, { sent: '1' })
}
