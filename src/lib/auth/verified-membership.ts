export type VerifiedAccessLane = 'admin' | 'client'

export type VerifiedMembership = {
  membership_id: string
  tenant_id: string
  user_id: string
  role_key: string
  brand_id: string | null
  workspace_id: string | null
  status: 'active'
}

const platformOperatorRoles = new Set(['platform_owner'])

export function membershipAllowsLane(
  membership: Pick<VerifiedMembership, 'role_key' | 'status'>,
  lane: VerifiedAccessLane,
) {
  if (membership.status !== 'active') return false
  if (lane === 'admin') return platformOperatorRoles.has(membership.role_key)
  return true
}

export function selectMembershipForLane(
  memberships: VerifiedMembership[],
  lane: VerifiedAccessLane,
): VerifiedMembership | null {
  const eligible = memberships.filter((membership) => membershipAllowsLane(membership, lane))

  if (lane === 'admin') {
    return eligible.find((membership) => membership.workspace_id) ?? eligible[0] ?? null
  }

  return (
    eligible.find(
      (membership) =>
        !platformOperatorRoles.has(membership.role_key) && membership.workspace_id,
    ) ??
    eligible.find((membership) => membership.workspace_id) ??
    eligible[0] ??
    null
  )
}

export function membershipHasWorkspaceAuthority(membership: VerifiedMembership) {
  return Boolean(
    membership.tenant_id.trim() &&
      membership.workspace_id?.trim() &&
      membership.brand_id?.trim(),
  )
}
