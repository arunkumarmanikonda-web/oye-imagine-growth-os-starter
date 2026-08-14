import { roleLane, rolePriority, roleRequiresMfa, type WorkspaceLane } from './role-routing'

export type VerifiedAccessLane = WorkspaceLane

export type VerifiedMembership = {
  membership_id: string
  tenant_id: string
  user_id: string
  role_key: string
  brand_id: string | null
  workspace_id: string | null
  status: 'active'
  metadata?: Record<string, unknown> | null
}

function metadataString(membership: Pick<VerifiedMembership, 'metadata'>, key: string) {
  const value = membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function metadataBoolean(membership: Pick<VerifiedMembership, 'metadata'>, key: string) {
  const value = membership.metadata?.[key]
  return typeof value === 'boolean' ? value : null
}

export function membershipExperienceRoleKey(membership: Pick<VerifiedMembership, 'role_key' | 'metadata'>) {
  return metadataString(membership, 'experienceRoleKey') ?? membership.role_key
}

export function membershipLane(membership: Pick<VerifiedMembership, 'role_key' | 'metadata'>): VerifiedAccessLane {
  const configured = metadataString(membership, 'accessLane')
  if (configured === 'admin' || configured === 'client') return configured
  return roleLane(membershipExperienceRoleKey(membership))
}

export function membershipRequiresMfa(membership: Pick<VerifiedMembership, 'role_key' | 'metadata'>) {
  const configured = metadataBoolean(membership, 'requiresMfa')
  if (configured !== null) return configured
  return roleRequiresMfa(membershipExperienceRoleKey(membership))
}

export function membershipPriority(membership: Pick<VerifiedMembership, 'role_key' | 'metadata'>) {
  return rolePriority(membershipExperienceRoleKey(membership))
}

export function membershipAllowsLane(
  membership: Pick<VerifiedMembership, 'role_key' | 'status' | 'metadata'>,
  lane: VerifiedAccessLane,
) {
  return membership.status === 'active' && membershipLane(membership) === lane
}

export function selectMembershipForLane(
  memberships: VerifiedMembership[],
  lane: VerifiedAccessLane,
): VerifiedMembership | null {
  return (
    memberships
      .filter((membership) => membershipAllowsLane(membership, lane))
      .sort((a, b) => membershipPriority(a) - membershipPriority(b))
      .find((membership) => membershipHasWorkspaceAuthority(membership)) ?? null
  )
}

export function selectPrimaryMembership(
  memberships: VerifiedMembership[],
): VerifiedMembership | null {
  return (
    [...memberships]
      .filter((membership) => membership.status === 'active')
      .sort((a, b) => membershipPriority(a) - membershipPriority(b))
      .find((membership) => membershipHasWorkspaceAuthority(membership)) ?? null
  )
}

export function membershipHasWorkspaceAuthority(membership: VerifiedMembership) {
  return Boolean(
    membership.tenant_id.trim() &&
      membership.workspace_id?.trim() &&
      membership.brand_id?.trim(),
  )
}
