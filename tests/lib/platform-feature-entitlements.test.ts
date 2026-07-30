import { describe, expect, it } from 'vitest';
import {
  isFeatureEnabled,
  resolveFeatureState,
} from '../../src/lib/platform/feature-entitlements';
import type {
  FeatureFlagDefinition,
  TenantFeatureEntitlement,
} from '../../src/lib/platform/control-plane-types';

describe('platform feature entitlements', () => {
  const definitions: FeatureFlagDefinition[] = [
    {
      flagKey: 'channels.google_ads',
      scopeType: 'tenant',
      description: 'Google Ads connector',
      defaultState: 'enabled',
    },
    {
      flagKey: 'marketplace.enabled',
      scopeType: 'tenant',
      description: 'Marketplace access',
      defaultState: 'gated',
    },
  ];

  it('uses default definition state when no override exists', () => {
    expect(
      resolveFeatureState(definitions, [], {
        tenantId: 'tenant_1',
        flagKey: 'channels.google_ads',
      }),
    ).toBe('enabled');
  });

  it('uses the most specific override', () => {
    const entitlements: TenantFeatureEntitlement[] = [
      {
        entitlementId: 'tenant_off',
        tenantId: 'tenant_1',
        flagKey: 'channels.google_ads',
        state: 'disabled',
        isActive: true,
        updatedAt: '2026-07-31T10:00:00Z',
      },
      {
        entitlementId: 'workspace_on',
        tenantId: 'tenant_1',
        flagKey: 'channels.google_ads',
        workspaceId: 'workspace_1',
        state: 'enabled',
        isActive: true,
        updatedAt: '2026-07-31T11:00:00Z',
      },
    ];

    expect(
      resolveFeatureState(definitions, entitlements, {
        tenantId: 'tenant_1',
        flagKey: 'channels.google_ads',
        workspaceId: 'workspace_1',
      }),
    ).toBe('enabled');
  });

  it('treats trial as enabled by default', () => {
    const entitlements: TenantFeatureEntitlement[] = [
      {
        entitlementId: 'trial_marketplace',
        tenantId: 'tenant_1',
        flagKey: 'marketplace.enabled',
        state: 'trial',
        isActive: true,
      },
    ];

    expect(
      isFeatureEnabled(definitions, entitlements, {
        tenantId: 'tenant_1',
        flagKey: 'marketplace.enabled',
      }),
    ).toBe(true);
  });
});