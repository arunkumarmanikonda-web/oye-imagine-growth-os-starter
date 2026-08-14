import { describe, expect, it } from 'vitest'
import {
  membershipMatchesTenant,
  membershipMatchesWorkspace,
  selectApiMembership,
  type ApiVerifiedMembership,
} from '@/lib/auth/api-access'

const clientMembership: ApiVerifiedMembership = {
  membership_id: 'membership_client_neejee',
  tenant_id: 'tenant_neejee',
  user_id: 'user_client',
  role_key: 'tenant_admin',
  brand_id: 'brand_neejee',
  workspace_id: 'workspace_neejee_primary',
  status: 'active',
  metadata: {
    operationalTenantId: 'tenant-uuid-neejee',
    operationalWorkspaceId: 'workspace-uuid-neejee',
  },
}

const platformOwner: ApiVerifiedMembership = {
  membership_id: 'membership_platform_owner_primary',
  tenant_id: 'tenant_oye_internal',
  user_id: 'user_owner',
  role_key: 'platform_owner',
  brand_id: 'brand_oye_imagine',
  workspace_id: 'workspace_oye_internal',
  status: 'active',
  metadata: {
    operationalTenantId: 'tenant-uuid-oye',
    operationalWorkspaceId: 'workspace-uuid-oye',
  },
}

describe('central API authorization policy', () => {
  it('matches stable and operational tenant/workspace identifiers', () => {
    expect(membershipMatchesTenant(clientMembership, 'tenant_neejee')).toBe(true)
    expect(membershipMatchesTenant(clientMembership, 'tenant-uuid-neejee')).toBe(true)
    expect(membershipMatchesWorkspace(clientMembership, 'workspace_neejee_primary')).toBe(true)
    expect(membershipMatchesWorkspace(clientMembership, 'workspace-uuid-neejee')).toBe(true)
  })

  it('denies cross-tenant and cross-workspace substitution for a client membership', () => {
    expect(membershipMatchesTenant(clientMembership, 'tenant_other')).toBe(false)
    expect(membershipMatchesWorkspace(clientMembership, 'workspace_other')).toBe(false)
    expect(
      selectApiMembership({
        memberships: [clientMembership],
        lane: 'client',
        tenantId: 'tenant_other',
      }),
    ).toBeNull()
  })

  it('does not allow a client tenant administrator into the admin lane', () => {
    expect(
      selectApiMembership({
        memberships: [clientMembership],
        lane: 'admin',
      }),
    ).toBeNull()
  })

  it('allows the platform owner to use the admin lane and governed tenant resources', () => {
    expect(
      selectApiMembership({
        memberships: [platformOwner],
        lane: 'admin',
      })?.membership_id,
    ).toBe('membership_platform_owner_primary')
    expect(membershipMatchesTenant(platformOwner, 'tenant-uuid-neejee')).toBe(true)
    expect(membershipMatchesWorkspace(platformOwner, 'workspace-uuid-neejee')).toBe(true)
  })
})
