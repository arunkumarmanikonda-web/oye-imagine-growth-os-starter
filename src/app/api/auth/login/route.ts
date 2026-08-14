import { NextRequest, NextResponse } from 'next/server'
import { buildAuthCookieRecord, createLoginRedirectPath } from '@/lib/auth/session'
import {
  membershipHasWorkspaceAuthority,
  selectMembershipForLane,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'
import { ACTIVE_WORKSPACE_COOKIE_KEY } from '@/lib/recovery/workspace-foundation'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function normalizeLane(value: string | null): VerifiedAccessLane {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'admin' || normalized === 'operator' ? 'admin' : 'client'
}

function loginErrorRedirect(request: NextRequest, lane: VerifiedAccessLane, code: string) {
  const url = new URL(lane === 'admin' ? '/login/admin' : '/login/client', request.url)
  url.searchParams.set('error', code)
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

function mfaRedirect(request: NextRequest, destination: string) {
  const url = new URL('/auth/mfa', request.url)
  url.searchParams.set('redirect', destination)
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const requestedLane = normalizeLane(String(formData.get('lane') ?? formData.get('role') ?? ''))
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const redirectInput = String(formData.get('redirectTo') ?? formData.get('redirect') ?? '').trim()

  if (!email || !password) {
    return loginErrorRedirect(request, requestedLane, 'missing_credentials')
  }

  const supabase = await createSupabaseServerClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    return loginErrorRedirect(request, requestedLane, 'invalid_credentials')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.id || !user.email) {
    await supabase.auth.signOut()
    return loginErrorRedirect(request, requestedLane, 'identity_verification_failed')
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipError) {
    await supabase.auth.signOut()
    return loginErrorRedirect(request, requestedLane, 'access_control_unavailable')
  }

  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  const membership = selectMembershipForLane(memberships, requestedLane)

  if (!membership || !membershipHasWorkspaceAuthority(membership)) {
    await supabase.auth.signOut()
    return loginErrorRedirect(request, requestedLane, 'access_denied')
  }

  const destination = createLoginRedirectPath(requestedLane, redirectInput)

  if (requestedLane === 'admin') {
    const { data: aalData, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aalError) {
      await supabase.auth.signOut()
      return loginErrorRedirect(request, requestedLane, 'access_control_unavailable')
    }

    if (aalData.currentLevel !== 'aal2') {
      return mfaRedirect(request, destination)
    }
  }

  const response = NextResponse.redirect(new URL(destination, request.url))
  response.headers.set('Cache-Control', 'private, no-store')

  // These cookies carry UI context only. Authentication and authorization must be
  // revalidated from Supabase Auth + core_tenant_memberships on protected requests.
  const contextCookies = buildAuthCookieRecord({
    lane: requestedLane,
    email: user.email.toLowerCase(),
    workspaceSlug: membership.workspace_id!,
    tenantSlug: membership.tenant_id,
    brandSlug: membership.brand_id!,
  })

  Object.entries(contextCookies).forEach(([key, value]) => {
    response.cookies.set(key, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  })

  response.cookies.set(ACTIVE_WORKSPACE_COOKIE_KEY, membership.workspace_id!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set('oye_session_state', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  response.cookies.set('oye_workspace_id', membership.workspace_id!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  response.cookies.set('oye_active_role', requestedLane, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  for (const cookieKey of Object.values(RECOVERY_AUTH_COOKIE_KEYS)) {
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
