import { describe, expect, it } from 'vitest'
import { getRoleExperience, roleLane, roleRequiresMfa, supportedRoleKeys } from '@/lib/auth/role-routing'

const expectedRoles = [
  'platform_owner',
  'tenant_admin',
  'account_manager',
  'brand_manager',
  'designer',
  'digital_marketer',
  'content_approver',
  'finance_approver',
  'analyst',
  'partner_specialist',
  'client_operator',
  'viewer',
]

describe('universal identity role experience', () => {
  it('has a scoped dashboard experience for every supported human role', () => {
    expect([...supportedRoleKeys].sort()).toEqual([...expectedRoles].sort())

    for (const roleKey of expectedRoles) {
      const role = getRoleExperience(roleKey)
      expect(role.key).toBe(roleKey)
      expect(role.headline.length).toBeGreaterThan(10)
      expect(role.nav.length).toBeGreaterThan(0)
      expect(role.nav[0]?.href).toBe('/workspace')
      expect(role.quickActions.length).toBeGreaterThan(0)
    }
  })

  it('keeps privileged operator roles behind MFA while client read experiences remain scoped', () => {
    for (const roleKey of expectedRoles) {
      if (roleLane(roleKey) === 'admin') expect(roleRequiresMfa(roleKey)).toBe(true)
    }
    expect(roleLane('client_operator')).toBe('client')
    expect(roleRequiresMfa('client_operator')).toBe(false)
    expect(roleLane('viewer')).toBe('client')
    expect(roleRequiresMfa('viewer')).toBe(false)
  })

  it('does not expose unrelated navigation to read-only client viewers', () => {
    const viewer = getRoleExperience('viewer')
    expect(viewer.nav.map((item) => item.href)).toEqual(['/workspace', '/client'])
    expect(viewer.nav.some((item) => item.href.startsWith('/admin'))).toBe(false)
  })

  it('scopes partner navigation to assigned delivery surfaces', () => {
    const partner = getRoleExperience('partner_specialist')
    expect(partner.nav.map((item) => item.href)).toEqual(['/workspace', '/admin/marketplace', '/admin/creative'])
  })
})
