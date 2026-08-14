import { describe, expect, it } from 'vitest'
import { permissionForPathname, permissionPatternMatches, resolvePermissionDecision, type PermissionOverride } from '../../src/lib/auth/permissions'

const membership = { tenant_id: 'tenant_demo', brand_id: 'brand_demo', workspace_id: 'workspace_demo' }
const override = (effect: 'allow'|'deny', permission_key: string): PermissionOverride => ({
  override_id: `o_${effect}_${permission_key}`,
  user_id: 'user_demo', tenant_id: null, brand_id: null, workspace_id: null,
  permission_key, effect, status: 'active', valid_from: '2026-01-01T00:00:00.000Z', valid_until: null,
})

describe('granular access permissions', () => {
  it('matches exact and wildcard permissions without accidental prefix grants', () => {
    expect(permissionPatternMatches('creative.*', 'creative.publish')).toBe(true)
    expect(permissionPatternMatches('creative.*', 'creative')).toBe(true)
    expect(permissionPatternMatches('creative.view', 'creative.view')).toBe(true)
    expect(permissionPatternMatches('creative.view', 'creative.publish')).toBe(false)
    expect(permissionPatternMatches('creative.*', 'creativeX.publish')).toBe(false)
  })

  it('makes explicit deny stronger than role defaults and explicit allow', () => {
    const decision = resolvePermissionDecision({ roleKey: 'designer', rolePermissions: ['creative.*'], overrides: [override('allow','creative.publish'), override('deny','creative.publish')], membership, permission: 'creative.publish' })
    expect(decision.allowed).toBe(false)
    expect(decision.source).toBe('explicit_deny')
  })

  it('allows Super Admin by default but still honors explicit deny', () => {
    expect(resolvePermissionDecision({ roleKey: 'platform_owner', rolePermissions: ['*'], overrides: [], membership, permission: 'finance.approve' }).allowed).toBe(true)
    const denied = resolvePermissionDecision({ roleKey: 'platform_owner', rolePermissions: ['*'], overrides: [override('deny','creative.publish')], membership, permission: 'creative.publish' })
    expect(denied.allowed).toBe(false)
  })

  it('maps protected UI and API routes to the same permission keys', () => {
    expect(permissionForPathname('/admin/config')).toBe('platform.config')
    expect(permissionForPathname('/api/admin/config/provider')).toBe('platform.config')
    expect(permissionForPathname('/client/finance')).toBe('finance.view')
    expect(permissionForPathname('/api/client/finance')).toBe('finance.view')
    expect(permissionForPathname('/admin/access-control')).toBe('platform.access')
  })
})
