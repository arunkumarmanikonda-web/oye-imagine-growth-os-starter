import { describe, expect, it } from 'vitest'
import { membershipExperienceRoleKey, membershipLane, membershipRequiresMfa, selectMembershipForLane, type VerifiedMembership } from '../../src/lib/auth/verified-membership'

function membership(metadata: Record<string, unknown>): VerifiedMembership {
  return { membership_id: 'm1', tenant_id: 'tenant_demo', user_id: 'u1', role_key: 'custom_performance_lead', brand_id: 'brand_demo', workspace_id: 'workspace_demo', status: 'active', metadata }
}

describe('custom role routing', () => {
  it('inherits an admin experience and MFA from its selected template', () => {
    const row = membership({ experienceRoleKey: 'digital_marketer', accessLane: 'admin', requiresMfa: true })
    expect(membershipExperienceRoleKey(row)).toBe('digital_marketer')
    expect(membershipLane(row)).toBe('admin')
    expect(membershipRequiresMfa(row)).toBe(true)
    expect(selectMembershipForLane([row], 'admin')?.role_key).toBe('custom_performance_lead')
  })

  it('supports custom client-facing read experiences without privileged MFA', () => {
    const row = membership({ experienceRoleKey: 'viewer', accessLane: 'client', requiresMfa: false })
    expect(membershipLane(row)).toBe('client')
    expect(membershipRequiresMfa(row)).toBe(false)
  })
})
