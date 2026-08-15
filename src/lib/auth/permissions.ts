import type { VerifiedMembership } from './verified-membership'

export type PermissionEffect = 'allow' | 'deny'

export type PermissionOverride = {
  override_id: string
  user_id: string
  tenant_id: string | null
  brand_id: string | null
  workspace_id: string | null
  permission_key: string
  effect: PermissionEffect
  status: 'active' | 'revoked' | 'expired'
  valid_from: string
  valid_until: string | null
}

export type EffectivePermissionDecision = {
  permission: string
  allowed: boolean
  source: 'platform_owner' | 'explicit_deny' | 'explicit_allow' | 'role_default' | 'not_granted'
  matchedPattern: string | null
}

export function permissionPatternMatches(pattern: string, permission: string) {
  const normalizedPattern = pattern.trim()
  const normalizedPermission = permission.trim()
  if (!normalizedPattern || !normalizedPermission) return false
  if (normalizedPattern === '*') return true
  if (normalizedPattern === normalizedPermission) return true
  if (normalizedPattern.endsWith('.*')) {
    const prefix = normalizedPattern.slice(0, -2)
    return normalizedPermission === prefix || normalizedPermission.startsWith(`${prefix}.`)
  }
  return false
}

export function overrideAppliesToMembership(
  override: PermissionOverride,
  membership: Pick<VerifiedMembership, 'tenant_id' | 'brand_id' | 'workspace_id'>,
  now = new Date(),
) {
  if (override.status !== 'active') return false
  if (new Date(override.valid_from).getTime() > now.getTime()) return false
  if (override.valid_until && new Date(override.valid_until).getTime() <= now.getTime()) return false
  if (override.tenant_id && override.tenant_id !== membership.tenant_id) return false
  if (override.brand_id && override.brand_id !== membership.brand_id) return false
  if (override.workspace_id && override.workspace_id !== membership.workspace_id) return false
  return true
}

export function resolvePermissionDecision(input: {
  roleKey: string
  rolePermissions: string[]
  overrides: PermissionOverride[]
  membership: Pick<VerifiedMembership, 'tenant_id' | 'brand_id' | 'workspace_id'>
  permission: string
}): EffectivePermissionDecision {
  const permission = input.permission.trim()
  const applicable = input.overrides.filter((override) =>
    overrideAppliesToMembership(override, input.membership),
  )
  const denied = applicable.find(
    (override) => override.effect === 'deny' && permissionPatternMatches(override.permission_key, permission),
  )
  if (denied) {
    return { permission, allowed: false, source: 'explicit_deny', matchedPattern: denied.permission_key }
  }

  if (input.roleKey === 'platform_owner') {
    return { permission, allowed: true, source: 'platform_owner', matchedPattern: '*' }
  }

  const allowed = applicable.find(
    (override) => override.effect === 'allow' && permissionPatternMatches(override.permission_key, permission),
  )
  if (allowed) {
    return { permission, allowed: true, source: 'explicit_allow', matchedPattern: allowed.permission_key }
  }

  const rolePattern = input.rolePermissions.find((pattern) => permissionPatternMatches(pattern, permission))
  if (rolePattern) {
    return { permission, allowed: true, source: 'role_default', matchedPattern: rolePattern }
  }

  return { permission, allowed: false, source: 'not_granted', matchedPattern: null }
}

const ROUTE_PERMISSION_PREFIXES: Array<[string, string]> = [
  ['/admin/access-control', 'platform.access'],
  ['/admin/config', 'platform.config'],
  ['/admin/brand-intelligence', 'brand.view'],
  ['/admin/creative', 'creative.view'],
  ['/admin/content', 'content.view'],
  ['/admin/execution-plan', 'campaign.view'],
  ['/admin/google-ads', 'campaign.view'],
  ['/admin/campaign-summary', 'reporting.view'],
  ['/admin/integrations', 'integration.view'],
  ['/admin/commercial/enquiries', 'commercial.enquiry.view'],
  ['/admin/commercial', 'finance.view'],
  ['/admin/marketplace', 'marketplace.view'],
  ['/admin/agents', 'ai.agent.manage'],
  ['/admin/ai-concierge', 'workspace.view'],
  ['/admin/privacy', 'privacy.view'],
  ['/client/finance', 'finance.view'],
  ['/client', 'workspace.view'],
  ['/workspace', 'workspace.view'],
]

function normalizedPermissionPath(pathname: string) {
  if (pathname.startsWith('/api/admin/')) return pathname.replace('/api/admin/', '/admin/')
  if (pathname === '/api/admin') return '/admin'
  if (pathname.startsWith('/api/client/')) return pathname.replace('/api/client/', '/client/')
  if (pathname === '/api/client') return '/client'
  return pathname
}

export function permissionForPathname(pathname: string) {
  const normalized = normalizedPermissionPath(pathname)
  const match = ROUTE_PERMISSION_PREFIXES.find(
    ([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
  return match?.[1] ?? null
}