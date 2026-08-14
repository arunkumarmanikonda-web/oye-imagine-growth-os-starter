import { describe, expect, it } from 'vitest'
import {
  deriveFinanceWorkspaceKey,
  resolveAuthorizedFinanceWorkspaceKey,
} from '@/lib/finance/finance-access'
import type { ApiVerifiedMembership } from '@/lib/auth/api-access'

const neejeeClient: ApiVerifiedMembership = {
  membership_id: 'membership_neejee_client',
  tenant_id: 'tenant_neejee',
  user_id: 'user_client',
  role_key: 'tenant_admin',
  brand_id: 'brand_neejee',
  workspace_id: 'workspace_neejee_primary',
  status: 'active',
  metadata: {},
}

const owner: ApiVerifiedMembership = {
  membership_id: 'membership_owner',
  tenant_id: 'tenant_oye_internal',
  user_id: 'user_owner',
  role_key: 'platform_owner',
  brand_id: 'brand_oye_imagine',
  workspace_id: 'workspace_oye_internal',
  status: 'active',
  metadata: {},
}

describe('client finance workspace access', () => {
  it('derives the client finance key from the authoritative tenant membership', () => {
    expect(deriveFinanceWorkspaceKey(neejeeClient)).toBe('neejee')
  })

  it('allows the client own finance workspace', () => {
    expect(
      resolveAuthorizedFinanceWorkspaceKey({
        membership: neejeeClient,
        requestedWorkspaceKey: 'neejee',
      }),
    ).toBe('neejee')
  })

  it('denies cross-client workspace substitution', () => {
    expect(
      resolveAuthorizedFinanceWorkspaceKey({
        membership: neejeeClient,
        requestedWorkspaceKey: 'other-client',
      }),
    ).toBeNull()
  })

  it('allows platform owner governed oversight of an explicitly requested workspace', () => {
    expect(
      resolveAuthorizedFinanceWorkspaceKey({
        membership: owner,
        requestedWorkspaceKey: 'neejee',
      }),
    ).toBe('neejee')
  })
})
