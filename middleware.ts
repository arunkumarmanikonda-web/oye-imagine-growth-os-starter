import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import {
  membershipHasWorkspaceAuthority,
  selectMembershipForLane,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from './src/lib/auth/verified-membership'
import { env } from './src/lib/env'

function requestedLane(pathname: string): VerifiedAccessLane {
  return pathname.startsWith('/admin') ? 'admin' : 'client'
}

function accessRedirect(request: NextRequest, lane: VerifiedAccessLane, code: string) {
  const url = request.nextUrl.clone()
  url.pathname = lane === 'admin' ? '/login/admin' : '/login/client'
  url.search = ''
  url.searchParams.set('redirect', request.nextUrl.pathname)
  url.searchParams.set('error', code)
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export async function middleware(request: NextRequest) {
  const lane = requestedLane(request.nextUrl.pathname)

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return accessRedirect(request, lane, 'access_control_unavailable')
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // The legacy Oye cookies are intentionally ignored as identity proof.
  // Supabase verifies the JWT signature before any protected route is allowed.
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const subject = claimsData?.claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    return accessRedirect(request, lane, 'unauthenticated')
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status')
    .eq('user_id', subject)
    .eq('status', 'active')

  if (membershipError) {
    return accessRedirect(request, lane, 'access_control_unavailable')
  }

  const membership = selectMembershipForLane(
    (membershipRows ?? []) as VerifiedMembership[],
    lane,
  )

  if (!membership || !membershipHasWorkspaceAuthority(membership)) {
    return accessRedirect(request, lane, 'access_denied')
  }

  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('x-oye-auth-source', 'supabase-verified')
  response.headers.set('x-oye-access-lane', lane)
  return response
}

export const config = {
  matcher: ['/client/:path*', '/admin/:path*'],
}
