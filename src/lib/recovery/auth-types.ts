export const RECOVERY_AUTH_ROLES = ['public', 'client', 'operator'] as const
export const RECOVERY_ROUTE_ROLES = ['client', 'operator'] as const
export const WORKSPACE_CONTEXT_SOURCES = ['explicit_selection', 'default_canonical'] as const

export type RecoveryAuthRole = (typeof RECOVERY_AUTH_ROLES)[number]
export type RecoveryRouteRole = (typeof RECOVERY_ROUTE_ROLES)[number]
export type WorkspaceContextSource = (typeof WORKSPACE_CONTEXT_SOURCES)[number]

export interface RecoveryAuthSession {
  sessionId: string | null
  role: RecoveryAuthRole
  email: string | null
  displayName: string | null
  isAuthenticated: boolean
}

export interface RecoveryWorkspaceOption {
  workspaceId: string
  tenantId: string
  brandId: string
  label: string
  description: string
}

export interface RecoveryWorkspaceContext {
  workspaceId: string
  tenantId: string
  brandId: string
  label: string
  description: string
  source: WorkspaceContextSource
  actorEmail: string | null
  sessionRole: RecoveryAuthRole
}

export interface RouteAccessDecision {
  allow: boolean
  redirectTo: string | null
  reason: 'authenticated' | 'missing_session' | 'wrong_role'
}

export const RECOVERY_AUTH_COOKIE_KEYS = {
  sessionId: 'oye_auth_session',
  role: 'oye_auth_role',
  email: 'oye_auth_email',
  displayName: 'oye_auth_name',
  activeWorkspaceId: 'oye_active_workspace',
} as const