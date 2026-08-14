import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import {
  membershipHasWorkspaceAuthority,
  selectMembershipForLane,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from './src/lib/auth/verified-membership'
import { env } from './src/lib/env'

type SupabaseCookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

function requestedLane(pathname: string): VerifiedAccessLane {
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin') ? 'admin' : 'client'
}

function isApiRequest(pathname: string) {
  return pathname.startsWith('/api/')
}

function apiFailure(code: string, status: 401 | 403 | 503) {
  const response = NextResponse.json(
    { ok: false, code, error: code },
    { status },
  )
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

function accessFailure(request: NextRequest, lane: VerifiedAccessLane, code: string) {
  if (isApiRequest(request.nextUrl.pathname)) {
    const status: 401 | 403 | 503 =
      code === 'unauthenticated' ? 401 : code === 'access_control_unavailable' ? 503 : 403
    return apiFailure(code, status)
  }

  const url = request.nextUrl.clone()
  url.pathname = lane === 'admin' ? '/login/admin' : '/login/client'
  url.search = ''
  url.searchParams.set('redirect', request.nextUrl.pathname)
  url.searchParams.set('error', code)
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

function mfaFailure(request: NextRequest) {
  if (isApiRequest(request.nextUrl.pathname)) {
    return apiFailure('mfa_required', 403)
  }

  const url = request.nextUrl.clone()
  url.pathname = '/auth/mfa'
  url.search = ''
  url.searchParams.set('redirect', request.nextUrl.pathname)
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export async function middleware(request: NextRequest) {
  const lane = requestedLane(request.nextUrl.pathname)

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return accessFailure(request, lane, 'access_control_unavailable')
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: SupabaseCookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const subject = claimsData?.claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    return accessFailure(request, lane, 'unauthenticated')
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status')
    .eq('user_id', subject)
    .eq('status', 'active')

  if (membershipError) {
    return accessFailure(request, lane, 'access_control_unavailable')
  }

  const membership = selectMembershipForLane(
    (membershipRows ?? []) as VerifiedMembership[],
    lane,
  )

  if (!membership || !membershipHasWorkspaceAuthority(membership)) {
    return accessFailure(request, lane, 'access_denied')
  }

  if (lane === 'admin') {
    const { data: aalData, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aalError) {
      return accessFailure(request, lane, 'access_control_unavailable')
    }

    if (aalData.currentLevel !== 'aal2') {
      return mfaFailure(request)
    }
  }

  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('x-oye-auth-source', 'supabase-verified')
  response.headers.set('x-oye-access-lane', lane)
  if (lane === 'admin') response.headers.set('x-oye-auth-aal', 'aal2')
  return response
}

export const config = {
  matcher: [
    '/client/:path*',
    '/admin/:path*',
    '/api/client/:path*',
    '/api/admin/:path*',
  ],
}
