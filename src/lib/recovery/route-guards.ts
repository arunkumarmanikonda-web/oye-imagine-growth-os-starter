import type {
  RecoveryAuthSession,
  RecoveryRouteRole,
  RouteAccessDecision,
} from './auth-types'

export function getRouteAccessDecision(
  session: RecoveryAuthSession,
  requiredRole: RecoveryRouteRole
): RouteAccessDecision {
  if (!session.isAuthenticated) {
    return {
      allow: false,
      redirectTo: requiredRole === 'operator' ? '/login/admin' : '/login/client',
      reason: 'missing_session',
    }
  }

  if (requiredRole === 'operator' && session.role !== 'operator') {
    return {
      allow: false,
      redirectTo: session.role === 'client' ? '/client' : '/login/admin',
      reason: 'wrong_role',
    }
  }

  if (requiredRole === 'client' && session.role !== 'client') {
    return {
      allow: false,
      redirectTo: session.role === 'operator' ? '/admin' : '/login/client',
      reason: 'wrong_role',
    }
  }

  return {
    allow: true,
    redirectTo: null,
    reason: 'authenticated',
  }
}

export function recoveryRouteRequiresRedirect(decision: RouteAccessDecision): boolean {
  return !decision.allow && Boolean(decision.redirectTo);
}
