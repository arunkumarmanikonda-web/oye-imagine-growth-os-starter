export type AccessDomain = 'public' | 'client_auth' | 'operator_auth' | 'client_protected' | 'operator_protected'
export type AccessRole = 'anonymous' | 'client' | 'operator'

export const ACCESS_COOKIE_KEYS = {
  role: 'oye_access_role',
  authReady: 'oye_access_ready',
} as const

export function getAccessDomain(pathname: string): AccessDomain {
  if (pathname === '/login/client') return 'client_auth'
  if (pathname === '/login/admin') return 'operator_auth'
  if (pathname === '/client' || pathname.startsWith('/client/')) return 'client_protected'
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'operator_protected'
  return 'public'
}

export function hasSupabaseSessionCookie(cookieNames: string[]) {
  return cookieNames.some((name) => name.startsWith('sb-') && name.includes('auth-token'))
}

export function resolveAccessRoleFromCookies(
  cookies: Record<string, string | undefined>,
): AccessRole {
  const explicitRole = cookies[ACCESS_COOKIE_KEYS.role]
  if (explicitRole === 'client') return 'client'
  if (explicitRole === 'operator') return 'operator'

  if (cookies[ACCESS_COOKIE_KEYS.authReady] === 'true') {
    return 'client'
  }

  return 'anonymous'
}

export function getLoginRedirect(pathname: string) {
  const encoded = encodeURIComponent(pathname)
  const domain = getAccessDomain(pathname)

  if (domain === 'operator_protected') {
    return `/login/admin?redirect=${encoded}`
  }

  if (domain === 'client_protected') {
    return `/login/client?redirect=${encoded}`
  }

  return '/login'
}

export function shouldProtectPath(pathname: string) {
  const domain = getAccessDomain(pathname)
  return domain === 'client_protected' || domain === 'operator_protected'
}

export function shouldRedirectForRole(pathname: string, role: AccessRole) {
  const domain = getAccessDomain(pathname)

  if (domain === 'operator_protected' && role !== 'operator') return true
  if (domain === 'client_protected' && role === 'anonymous') return true

  return false
}

export function getPostLoginDestination(role: AccessRole) {
  if (role === 'operator') return '/admin'
  if (role === 'client') return '/client'
  return '/login'
}