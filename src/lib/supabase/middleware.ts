import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { membershipRequiresMfa, selectMembershipForLane, selectPrimaryMembership, type VerifiedMembership } from '@/lib/auth/verified-membership'
import { loadPermissionSet, decidePermission } from '@/lib/auth/access-resolver'
import { permissionForPathname } from '@/lib/auth/permissions'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

function apiError(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function mustChangePassword(user: { app_metadata?: Record<string, unknown> | null }) {
  return user.app_metadata?.must_change_password === true
}

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
  const isApiAdmin = pathname === '/api/admin' || pathname.startsWith('/api/admin/')
  const isApiClient = pathname === '/api/client' || pathname.startsWith('/api/client/')
  const isWorkspace = pathname.startsWith('/workspace')
  const isAdmin = pathname.startsWith('/admin') || isApiAdmin
  const isClient = pathname.startsWith('/client') || isApiClient
  const isApiProtected = isApiAdmin || isApiClient
  const isUnifiedLogin = pathname === '/login' || pathname === '/login/admin' || pathname === '/login/client'
  const isSignup = pathname.startsWith('/signup')
  const isPasswordChange = pathname.startsWith('/account/change-password')
  const protectedRoute = isWorkspace || isAdmin || isClient

  if (!user) {
    if (protectedRoute || isPasswordChange) {
      if (isApiProtected) return apiError('unauthenticated', 401)
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.search = ''
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return response
  }

  if (mustChangePassword(user)) {
    if (isPasswordChange) return response
    if (isApiProtected) return apiError('password_change_required', 403)
    if (protectedRoute || isUnifiedLogin || isSignup) {
      const reset = new URL('/account/change-password', request.url)
      reset.searchParams.set('next', protectedRoute ? pathname : '/workspace')
      return NextResponse.redirect(reset)
    }
  } else if (isPasswordChange) {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipError) {
    if (isApiProtected) return apiError('access_control_unavailable', 503)
    if (protectedRoute) return NextResponse.redirect(new URL('/login?error=access_control_unavailable', request.url))
    return response
  }

  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  const primary = selectPrimaryMembership(memberships)
  if ((isUnifiedLogin || isSignup) && primary) return NextResponse.redirect(new URL('/workspace', request.url))
  if (!protectedRoute) return response
  if (!primary) {
    if (isApiProtected) return apiError('access_denied', 403)
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url))
  }

  const membership = isAdmin ? selectMembershipForLane(memberships, 'admin') : isClient ? selectMembershipForLane(memberships, 'client') : primary
  if (!membership) {
    if (isApiProtected) return apiError('access_denied', 403)
    return NextResponse.redirect(new URL('/workspace?error=scope', request.url))
  }

  if (membershipRequiresMfa(membership)) {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError) {
      if (isApiProtected) return apiError('access_control_unavailable', 503)
      return NextResponse.redirect(new URL('/login?error=access_control_unavailable', request.url))
    }
    if (aalData.currentLevel !== 'aal2') {
      if (isApiProtected) return apiError('mfa_required', 403)
      const mfa = new URL('/auth/mfa', request.url)
      mfa.searchParams.set('redirect', pathname)
      return NextResponse.redirect(mfa)
    }
  }

  const permission = permissionForPathname(pathname)
  if (permission) {
    try {
      const permissionSet = await loadPermissionSet({ supabase, subject: user.id, membership })
      const decision = decidePermission({ roleKey: membership.role_key, membership, permissionSet, permission })
      if (!decision.allowed) {
        if (isApiProtected) return apiError('access_denied', 403)
        return NextResponse.redirect(new URL('/workspace?error=permission', request.url))
      }
    } catch {
      if (isApiProtected) return apiError('access_control_unavailable', 503)
      return NextResponse.redirect(new URL('/login?error=access_control_unavailable', request.url))
    }
  }

  return response
}
