import type { ApiVerifiedMembership } from '@/lib/auth/api-access'

function metadataString(membership: ApiVerifiedMembership, key: string) {
  const value = membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null
}

export function deriveFinanceWorkspaceKey(
  membership: ApiVerifiedMembership,
): string | null {
  const explicit = metadataString(membership, 'financeWorkspaceKey')
  if (explicit) return explicit

  const stableTenantId = membership.tenant_id.trim().toLowerCase()
  if (stableTenantId.startsWith('tenant_') && stableTenantId.length > 'tenant_'.length) {
    return stableTenantId.slice('tenant_'.length)
  }

  return null
}

export function resolveAuthorizedFinanceWorkspaceKey(input: {
  membership: ApiVerifiedMembership
  requestedWorkspaceKey?: string | null
  platformOwnerDefault?: string | null
}): string | null {
  const requested = input.requestedWorkspaceKey?.trim().toLowerCase() || null

  if (input.membership.role_key === 'platform_owner') {
    return requested ?? input.platformOwnerDefault?.trim().toLowerCase() ?? null
  }

  const authorized = deriveFinanceWorkspaceKey(input.membership)
  if (!authorized) return null
  if (requested && requested !== authorized) return null
  return authorized
}
