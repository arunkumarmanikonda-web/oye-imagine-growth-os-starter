import type { AuthSession } from './session'

export interface RouteAccessDecision {
  allow: boolean
  redirectTo: string | null
  reason: 'public' | 'allowed' | 'missing_auth' | 'lane_mismatch' | 'already_authenticated' | 'not_applicable'
}

export function evaluateRouteAccess(pathname: string, session: AuthSession): RouteAccessDecision {
  if (pathname.startsWith('/admin')) {
    if (!session.isAuthenticated) {
      return {
        allow: false,
        redirectTo: `/login/admin?redirectTo=${encodeURIComponent(pathname)}`,
        reason: 'missing_auth',
      }
    }

    if (session.lane !== 'admin') {
      return {
        allow: false,
        redirectTo: `/login/admin?redirectTo=${encodeURIComponent(pathname)}`,
        reason: 'lane_mismatch',
      }
    }

    return { allow: true, redirectTo: null, reason: 'allowed' }
  }

  if (pathname.startsWith('/client')) {
    if (!session.isAuthenticated) {
      return {
        allow: false,
        redirectTo: `/login/client?redirectTo=${encodeURIComponent(pathname)}`,
        reason: 'missing_auth',
      }
    }

    if (session.lane !== 'client') {
      return {
        allow: false,
        redirectTo: `/login/client?redirectTo=${encodeURIComponent(pathname)}`,
        reason: 'lane_mismatch',
      }
    }

    return { allow: true, redirectTo: null, reason: 'allowed' }
  }

  if (pathname === '/login/admin') {
    if (session.isAuthenticated && session.lane === 'admin') {
      return { allow: false, redirectTo: '/admin', reason: 'already_authenticated' }
    }

    return { allow: true, redirectTo: null, reason: 'public' }
  }

  if (pathname === '/login/client') {
    if (session.isAuthenticated && session.lane === 'client') {
      return { allow: false, redirectTo: '/client', reason: 'already_authenticated' }
    }

    return { allow: true, redirectTo: null, reason: 'public' }
  }

  return { allow: true, redirectTo: null, reason: 'not_applicable' }
}
