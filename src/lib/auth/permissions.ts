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
  if (input.roleKey === 'platform_owner') {
    const denied = input.overrides.find(
      (override) =>
        override.effect === 'deny' &&
        overrideAppliesToMembership(override, input.membership) &&
        permissionPatternMatches(override.permission_key, permission),
    )
    if (denied) {
      return { permission, allowed: false, source: 'explicit_deny', matchedPattern: denied.permission_key }
    }
    return { permission, allowed: true, source: 'platform_owner', matchedPattern: '*' }
  }

  const applicable = input.overrides.filter((override) =>
    overrideAppliesToMembership(override, input.membership),
  )
  const denied = applicable.find(
    (override) => override.effect === 'deny' && permissionPatternMatches(override.permission_key, permission),
  )
  if (denied) {
    return { permission, allowed: false, source: 'explicit_deny', matchedPattern: denied.permission_key }
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
  ['/api/admin/access/', 'platform.access'],
  ['/admin/config', 'platform.config'],
  ['/api/admin/config/', 'platform.config'],
  ['/admin/brand-intelligence', 'brand.view'],
  ['/admin/creative', 'creative.view'],
  ['/admin/content', 'content.view'],
  ['/admin/execution-plan', 'campaign.view'],
  ['/admin/google-ads', 'campaign.view'],
  ['/admin/campaign-summary', 'reporting.view'],
  ['/admin/integrations', 'integration.view'],
  ['/admin/commercial', 'finance.view'],
  ['/admin/marketplace', 'marketplace.view'],
  ['/admin/agents', 'ai.agent.manage'],
  ['/admin/ai-concierge', 'workspace.view'],
  ['/admin/privacy', 'privacy.view'],
  ['/client/finance', 'finance.view'],
  ['/client', 'workspace.view'],
  ['/workspace', 'workspace.view'],
]

export function permissionForPathname(pathname: string) {
  const match = ROUTE_PERMISSION_PREFIXES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix))
  return match?.[1] ?? null
}
