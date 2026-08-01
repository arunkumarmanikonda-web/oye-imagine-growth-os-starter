export type AuthAudience = 'public' | 'client' | 'operator'
export type AuthenticatedRole = 'client' | 'operator'

export type SessionState = {
  isAuthenticated: boolean
  role: AuthenticatedRole | null
  userId: string | null
  workspaceId: string | null
}

export type RouteAccessDecision = {
  path: string
  audience: AuthAudience
  requiresAuth: boolean
  allowed: boolean
  redirectTo: string | null
  reason: string
}

const publicRoutes = ['/', '/contact', '/marketplace', '/login', '/admin/login'] as const
const clientPrefixes = ['/client'] as const
const operatorPrefixes = ['/admin'] as const

export function normalizePath(pathname: string) {
  if (!pathname) return '/'
  const trimmed = pathname.trim()
  if (trimmed === '') return '/'
  const withoutQuery = trimmed.split('?')[0].split('#')[0]
  if (withoutQuery === '') return '/'
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
}

export function getRouteAudience(pathname: string): AuthAudience {
  const path = normalizePath(pathname)

  if (path === '/admin/login') return 'public'
  if (operatorPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return 'operator'
  if (clientPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return 'client'
  if (publicRoutes.includes(path as (typeof publicRoutes)[number])) return 'public'

  return 'public'
}

export function resolveSessionAccess(pathname: string, session: SessionState): RouteAccessDecision {
  const path = normalizePath(pathname)
  const audience = getRouteAudience(path)
  const requiresAuth = audience !== 'public'

  if (!requiresAuth) {
    return {
      path,
      audience,
      requiresAuth,
      allowed: true,
      redirectTo: null,
      reason: 'public-route'
    }
  }

  if (!session.isAuthenticated || !session.role) {
    return {
      path,
      audience,
      requiresAuth,
      allowed: false,
      redirectTo: audience === 'operator' ? '/admin/login' : '/login',
      reason: 'authentication-required'
    }
  }

  if (audience === 'client' && session.role !== 'client') {
    return {
      path,
      audience,
      requiresAuth,
      allowed: false,
      redirectTo: '/admin',
      reason: 'operator-cannot-open-client-route'
    }
  }

  if (audience === 'operator' && session.role !== 'operator') {
    return {
      path,
      audience,
      requiresAuth,
      allowed: false,
      redirectTo: '/client',
      reason: 'client-cannot-open-operator-route'
    }
  }

  return {
    path,
    audience,
    requiresAuth,
    allowed: true,
    redirectTo: null,
    reason: 'authorized'
  }
}

export function getSessionAccessAudit() {
  return {
    publicRoutes,
    clientPrefixes,
    operatorPrefixes,
    loginEntries: ['/login', '/admin/login'],
    denialMap: {
      publicToClient: '/login',
      publicToOperator: '/admin/login',
      clientToOperator: '/client',
      operatorToClient: '/admin'
    }
  }
}