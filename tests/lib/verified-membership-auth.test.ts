import { describe, expect, it } from 'vitest'
import {
  membershipAllowsLane,
  membershipHasWorkspaceAuthority,
  selectMembershipForLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'

const clientMembership: VerifiedMembership = {
  membership_id: 'membership_client',
  tenant_id: 'tenant_neejee',
  user_id: 'user_client',
  role_key: 'brand_manager',
  brand_id: 'brand_neejee',
  workspace_id: 'workspace_neejee_primary',
  status: 'active',
}

const platformOwnerMembership: VerifiedMembership = {
  membership_id: 'membership_platform_owner',
  tenant_id: 'tenant_oye_internal',
  user_id: 'user_owner',
  role_key: 'platform_owner',
  brand_id: 'brand_oye_imagine',
  workspace_id: 'workspace_oye_internal',
  status: 'active',
}

describe('verified membership authorization', () => {
  it('does not allow a client membership to self-select the admin lane', () => {
    expect(membershipAllowsLane(clientMembership, 'admin')).toBe(false)
    expect(selectMembershipForLane([clientMembership], 'admin')).toBeNull()
  })

  it('allows the platform owner membership to enter the operator surface', () => {
    expect(membershipAllowsLane(platformOwnerMembership, 'admin')).toBe(true)
    expect(selectMembershipForLane([platformOwnerMembership], 'admin')).toEqual(
      platformOwnerMembership,
    )
  })

  it('prefers a non-platform client membership for the client surface', () => {
    expect(
      selectMembershipForLane(
        [platformOwnerMembership, clientMembership],
        'client',
      ),
    ).toEqual(clientMembership)
  })

  it('fails workspace authority when tenant, brand, or workspace context is incomplete', () => {
    expect(membershipHasWorkspaceAuthority(clientMembership)).toBe(true)
    expect(
      membershipHasWorkspaceAuthority({
        ...clientMembership,
        workspace_id: null,
      }),
    ).toBe(false)
    expect(
      membershipHasWorkspaceAuthority({
        ...clientMembership,
        brand_id: null,
      }),
    ).toBe(false)
  })
})
