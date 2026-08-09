export type AccessLane = 'public' | 'client' | 'admin'

export interface AuthSession {
  lane: AccessLane
  isAuthenticated: boolean
  email: string | null
  workspaceSlug: string | null
  tenantSlug: string | null
  brandSlug: string | null
  issuedAt: string | null
}

export const authCookieKeys = {
  lane: 'oi_auth_lane',
  email: 'oi_auth_email',
  workspaceSlug: 'oi_workspace_slug',
  tenantSlug: 'oi_tenant_slug',
  brandSlug: 'oi_brand_slug',
  issuedAt: 'oi_auth_issued_at',
} as const

export function isAccessLane(value: string | null | undefined): value is AccessLane {
  return value === 'public' || value === 'client' || value === 'admin'
}

function clean(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function resolveAuthSessionFromCookieMap(
  cookieMap: Partial<Record<(typeof authCookieKeys)[keyof typeof authCookieKeys], string | null | undefined>>,
): AuthSession {
  const laneValue = clean(cookieMap[authCookieKeys.lane])
  const email = clean(cookieMap[authCookieKeys.email])

  if (!isAccessLane(laneValue) || laneValue === 'public' || !email) {
    return {
      lane: 'public',
      isAuthenticated: false,
      email: null,
      workspaceSlug: null,
      tenantSlug: null,
      brandSlug: null,
      issuedAt: null,
    }
  }

  return {
    lane: laneValue,
    isAuthenticated: true,
    email,
    workspaceSlug: clean(cookieMap[authCookieKeys.workspaceSlug]),
    tenantSlug: clean(cookieMap[authCookieKeys.tenantSlug]),
    brandSlug: clean(cookieMap[authCookieKeys.brandSlug]),
    issuedAt: clean(cookieMap[authCookieKeys.issuedAt]),
  }
}

export function createLoginRedirectPath(lane: Exclude<AccessLane, 'public'>, requestedPath?: string | null): string {
  const fallback = lane === 'admin' ? '/admin' : '/client'
  const normalized = clean(requestedPath)

  if (!normalized || !normalized.startsWith('/')) {
    return fallback
  }

  if (lane === 'admin') {
    return normalized.startsWith('/admin') ? normalized : fallback
  }

  return normalized.startsWith('/client') ? normalized : fallback
}

export function buildAuthCookieRecord(input: {
  lane: Exclude<AccessLane, 'public'>
  email: string
  workspaceSlug: string
  tenantSlug: string
  brandSlug: string
  issuedAt?: string
}): Record<string, string> {
  return {
    [authCookieKeys.lane]: input.lane,
    [authCookieKeys.email]: input.email.trim().toLowerCase(),
    [authCookieKeys.workspaceSlug]: input.workspaceSlug,
    [authCookieKeys.tenantSlug]: input.tenantSlug,
    [authCookieKeys.brandSlug]: input.brandSlug,
    [authCookieKeys.issuedAt]: input.issuedAt ?? new Date().toISOString(),
  }
}

export function getClearedAuthCookieKeys(): string[] {
  return [
    authCookieKeys.lane,
    authCookieKeys.email,
    authCookieKeys.workspaceSlug,
    authCookieKeys.tenantSlug,
    authCookieKeys.brandSlug,
    authCookieKeys.issuedAt,
  ]
}
