export type BatchARole = 'public' | 'client' | 'admin'
export type BatchASurface = 'public' | 'client' | 'admin'
export type RuntimeDecisionReason =
  | 'guards_disabled'
  | 'allowed'
  | 'unauthenticated'
  | 'insufficient_role'
  | 'workspace_required'

export interface RuntimeRoutePolicy {
  key: string
  prefix: string
  surface: BatchASurface
  allowedRoles: BatchARole[]
  requiresAuth: boolean
  requiresWorkspace: boolean
  redirectTo: string
}

export interface RuntimeAccessInput {
  pathname: string
  role?: BatchARole | null
  isAuthenticated: boolean
  workspaceId?: string | null
}

export interface RuntimeAccessDecision {
  allow: boolean
  surface: BatchASurface
  reason: RuntimeDecisionReason
  redirectTo: string | null
  redirectPath: string | null
  errorCode: string | null
  matchedPolicy: RuntimeRoutePolicy | null
  flags: {
    guardsEnabled: boolean
    liveSessionEnabled: boolean
  }
}

const runtimeRoutePolicies: RuntimeRoutePolicy[] = [
  {
    key: 'client-root',
    prefix: '/client',
    surface: 'client',
    allowedRoles: ['client'],
    requiresAuth: true,
    requiresWorkspace: true,
    redirectTo: '/login/client'
  },
  {
    key: 'admin-root',
    prefix: '/admin',
    surface: 'admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresWorkspace: true,
    redirectTo: '/login/admin'
  },
  {
    key: 'admin-content',
    prefix: '/admin/content',
    surface: 'admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresWorkspace: true,
    redirectTo: '/login/admin'
  },
  {
    key: 'admin-config',
    prefix: '/admin/config',
    surface: 'admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresWorkspace: true,
    redirectTo: '/login/admin'
  },
  {
    key: 'admin-support',
    prefix: '/admin/support',
    surface: 'admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresWorkspace: true,
    redirectTo: '/login/admin'
  },
  {
    key: 'admin-runtime',
    prefix: '/admin/runtime',
    surface: 'admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresWorkspace: true,
    redirectTo: '/login/admin'
  }
]

function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/'
  }

  let normalized = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

function normalizeRole(role?: BatchARole | null): BatchARole {
  if (role === 'client' || role === 'admin') {
    return role
  }

  return 'public'
}

function getMatchingPolicy(pathname: string) {
  const normalizedPathname = normalizePathname(pathname)

  return [...runtimeRoutePolicies]
    .sort((left, right) => right.prefix.length - left.prefix.length)
    .find(
      (policy) =>
        normalizedPathname === policy.prefix ||
        normalizedPathname.startsWith(`${policy.prefix}/`)
    ) ?? null
}

export function getBatchARuntimeFlags() {
  return {
    guardsEnabled: process.env.ENABLE_BATCH_A_ROUTE_GUARDS === 'true',
    liveSessionEnabled: process.env.ENABLE_BATCH_A_LIVE_SESSION === 'true'
  }
}

export function getRuntimeRoutePolicies() {
  return runtimeRoutePolicies
}

export function resolveRuntimeAccess(input: RuntimeAccessInput): RuntimeAccessDecision {
  const flags = getBatchARuntimeFlags()
  const pathname = normalizePathname(input.pathname)
  const role = normalizeRole(input.role)
  const matchedPolicy = getMatchingPolicy(pathname)

  if (!matchedPolicy) {
    return {
      allow: true,
      surface: 'public',
      reason: flags.guardsEnabled ? 'allowed' : 'guards_disabled',
      redirectTo: null,
      redirectPath: null,
      errorCode: null,
      matchedPolicy: null,
      flags
    }
  }

  if (!flags.guardsEnabled) {
    return {
      allow: true,
      surface: matchedPolicy.surface,
      reason: 'guards_disabled',
      redirectTo: null,
      redirectPath: null,
      errorCode: null,
      matchedPolicy,
      flags
    }
  }

  if (matchedPolicy.requiresAuth && !input.isAuthenticated) {
    return {
      allow: false,
      surface: matchedPolicy.surface,
      reason: 'unauthenticated',
      redirectTo: matchedPolicy.redirectTo,
      redirectPath: pathname,
      errorCode: 'unauthenticated',
      matchedPolicy,
      flags
    }
  }

  if (!matchedPolicy.allowedRoles.includes(role)) {
    return {
      allow: false,
      surface: matchedPolicy.surface,
      reason: 'insufficient_role',
      redirectTo: matchedPolicy.redirectTo,
      redirectPath: pathname,
      errorCode: 'insufficient_role',
      matchedPolicy,
      flags
    }
  }

  if (matchedPolicy.requiresWorkspace && !input.workspaceId) {
    return {
      allow: false,
      surface: matchedPolicy.surface,
      reason: 'workspace_required',
      redirectTo: matchedPolicy.redirectTo,
      redirectPath: pathname,
      errorCode: 'workspace_required',
      matchedPolicy,
      flags
    }
  }

  return {
    allow: true,
    surface: matchedPolicy.surface,
    reason: 'allowed',
    redirectTo: null,
    redirectPath: null,
    errorCode: null,
    matchedPolicy,
    flags
  }
}

export function getRuntimeShellAudit() {
  const flags = getBatchARuntimeFlags()

  return {
    title: 'Runtime shell enforcement',
    subtitle:
      'Feature-flagged enforcement of public, client, and operator boundaries with canonical runtime access rules.',
    flags,
    protectedPrefixes: runtimeRoutePolicies
      .filter((policy) => policy.requiresAuth)
      .map((policy) => policy.prefix),
    publicEntryPoints: ['/', '/marketplace', '/contact', '/login', '/login/client', '/login/admin'],
    governanceRules: [
      'Client and admin routes must remain inaccessible to anonymous traffic whenever route guards are active.',
      'Every authenticated client and admin route must resolve against a canonical workspace before surface access is granted.',
      'Runtime routing must never fall back to mixed-shell behavior once enforcement is enabled.'
    ],
    policies: runtimeRoutePolicies.map((policy) => ({
      key: policy.key,
      prefix: policy.prefix,
      surface: policy.surface,
      redirectTo: policy.redirectTo,
      requiresWorkspace: policy.requiresWorkspace
    }))
  }
}