import { roleLane, rolePriority, type WorkspaceLane } from './role-routing'

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

export function membershipAllowsLane(
  membership: Pick<VerifiedMembership, 'role_key' | 'status'>,
  lane: VerifiedAccessLane,
) {
  return membership.status === 'active' && roleLane(membership.role_key) === lane
}

export function selectMembershipForLane(
  memberships: VerifiedMembership[],
  lane: VerifiedAccessLane,
): VerifiedMembership | null {
  return (
    memberships
      .filter((membership) => membershipAllowsLane(membership, lane))
      .sort((a, b) => rolePriority(a.role_key) - rolePriority(b.role_key))
      .find((membership) => membershipHasWorkspaceAuthority(membership)) ?? null
  )
}

export function selectPrimaryMembership(
  memberships: VerifiedMembership[],
): VerifiedMembership | null {
  return (
    [...memberships]
      .filter((membership) => membership.status === 'active')
      .sort((a, b) => rolePriority(a.role_key) - rolePriority(b.role_key))
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
