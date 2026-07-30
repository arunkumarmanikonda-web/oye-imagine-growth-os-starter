import { describe, expect, it } from 'vitest';
import {
  authorizeTenantAction,
  hasPermission,
} from '../../src/lib/platform/tenant-security';
import type { TenantMembership } from '../../src/lib/platform/control-plane-types';

describe('platform tenant security', () => {
  const membership: TenantMembership = {
    membershipId: 'membership_1',
    tenantId: 'tenant_1',
    userId: 'user_1',
    roleKey: 'tenant_admin',
    permissions: ['tenant.*', 'brand.view', 'approval.*'],
    status: 'active',
  };

  it('matches wildcard permissions', () => {
    expect(hasPermission(membership, 'tenant.update')).toBe(true);
    expect(hasPermission(membership, 'approval.create')).toBe(true);
    expect(hasPermission(membership, 'finance.view')).toBe(false);
  });

  it('blocks cross-tenant access', () => {
    const result = authorizeTenantAction(membership, {
      tenantId: 'tenant_2',
      requiredPermission: 'tenant.update',
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('cross_tenant');
  });

  it('blocks disabled features', () => {
    const result = authorizeTenantAction(membership, {
      tenantId: 'tenant_1',
      requiredPermission: 'tenant.update',
      featureState: 'gated',
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('feature_disabled');
  });

  it('allows valid active membership actions', () => {
    const result = authorizeTenantAction(membership, {
      tenantId: 'tenant_1',
      requiredPermission: 'tenant.update',
      featureState: 'enabled',
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('ok');
  });
});