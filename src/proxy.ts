import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { membershipAllowsLane, type VerifiedMembership } from '@/lib/auth/verified-membership'

type CookieToSet = { name: string; value: string; options: CookieOptions }

function denied(status: 401 | 403 | 503, code: string, message: string) {
  return NextResponse.json({ ok: false, error: code, message }, { status })
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value, options } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
      },
    },
  })

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as Record<string, unknown> | undefined
  const subject = claims?.sub
  if (claimsError || typeof subject !== 'string' || !subject) return denied(401, 'unauthenticated', 'Verified sign-in is required.')

  const appMetadata = claims?.app_metadata
  if (appMetadata && typeof appMetadata === 'object' && (appMetadata as Record<string, unknown>).must_change_password === true) {
    return denied(403, 'password_change_required', 'A password change is required before privileged access.')
  }

  const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalError) return denied(503, 'access_control_unavailable', 'MFA assurance could not be verified.')
  if (aalData.currentLevel !== 'aal2') return denied(403, 'mfa_required', 'Multi-factor authentication is required for privileged access.')

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata')
    .eq('user_id', subject)
    .eq('status', 'active')

  if (membershipError) return denied(503, 'access_control_unavailable', 'Authorization control plane is unavailable.')
  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  if (!memberships.some((membership) => membershipAllowsLane(membership, 'admin'))) {
    return denied(403, 'access_denied', 'The signed-in identity is not authorized for privileged administration.')
  }

  response.headers.set('x-oye-admin-boundary', 'aal2-verified')
  return response
}

export const config = { matcher: ['/api/admin/:path*'] }
