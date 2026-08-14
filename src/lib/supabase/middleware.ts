import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { selectMembershipForLane, selectPrimaryMembership, type VerifiedMembership } from '@/lib/auth/verified-membership'
import { roleRequiresMfa } from '@/lib/auth/role-routing'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options as any))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isWorkspace = pathname.startsWith('/workspace')
  const isAdmin = pathname.startsWith('/admin')
  const isClient = pathname.startsWith('/client')
  const isUnifiedLogin = pathname === '/login' || pathname === '/login/admin' || pathname === '/login/client'
  const isSignup = pathname.startsWith('/signup')
  const protectedRoute = isWorkspace || isAdmin || isClient

  if (!user) {
    if (protectedRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.search = ''
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return response
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipError) {
    if (protectedRoute) return NextResponse.redirect(new URL('/login?error=access_control_unavailable', request.url))
    return response
  }

  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  const primary = selectPrimaryMembership(memberships)

  if ((isUnifiedLogin || isSignup) && primary) return NextResponse.redirect(new URL('/workspace', request.url))
  if (!protectedRoute) return response
  if (!primary) return NextResponse.redirect(new URL('/login?error=access_denied', request.url))

  const membership = isAdmin
    ? selectMembershipForLane(memberships, 'admin')
    : isClient
      ? selectMembershipForLane(memberships, 'client')
      : primary

  if (!membership) return NextResponse.redirect(new URL('/workspace?error=scope', request.url))

  if (roleRequiresMfa(membership.role_key)) {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError) return NextResponse.redirect(new URL('/login?error=access_control_unavailable', request.url))
    if (aalData.currentLevel !== 'aal2') {
      const mfa = new URL('/auth/mfa', request.url)
      mfa.searchParams.set('redirect', pathname)
      return NextResponse.redirect(mfa)
    }
  }

  return response
}
