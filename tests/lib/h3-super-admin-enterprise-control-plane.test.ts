import { describe, expect, it } from 'vitest';
import {
  assessEnterpriseReadiness,
  buildFeatureGovernanceRegister,
  buildPortfolioHealthRollup,
  buildTenantGovernanceSnapshot,
  canImpersonate,
  type FeatureFlagAssignment,
  type HealthSignal,
  type TenantRecord,
} from '../../src/lib/platform/h3-super-admin-enterprise-control-plane';

const enterpriseTenant: TenantRecord = {
  tenantId: 'tenant-neejee-enterprise',
  displayName: 'Neejee Enterprise',
  plan: 'enterprise',
  status: 'active',
  deploymentMode: 'dedicated',
  brandMode: 'white_label',
  customDomain: true,
  ssoReady: true,
  scimReady: true,
  supportImpersonationEnabled: true,
  aiRoutingPolicy: 'tenant_pinned',
  financeOversightEnabled: true,
};

const featureFlags: FeatureFlagAssignment[] = [
  {
    key: 'advanced-routing',
    label: 'Advanced AI routing',
    state: 'enabled',
    source: 'manual_override',
    owner: 'platform-governance',
  },
  {
    key: 'partner-portal-beta',
    label: 'Partner portal beta',
    state: 'pilot',
    source: 'experiment',
    owner: 'enterprise-ops',
  },
];

const healthSignals: HealthSignal[] = [
  { area: 'platform', level: 'healthy', summary: 'Core controls healthy' },
  { area: 'security', level: 'healthy', summary: 'Security checks passing' },
  { area: 'finance', level: 'warning', summary: 'Finance oversight review pending' },
];

describe('h3 super-admin enterprise control plane', () => {
  it('allows impersonation only for super admin with full audit context', () => {
    const allowed = canImpersonate(
      {
        actorRole: 'super_admin',
        ticketId: 'SUP-1042',
        reason: 'Investigate tenant admin access issue after entitlement update',
      },
      enterpriseTenant,
    );

    expect(allowed.allowed).toBe(true);
    expect(allowed.reasons).toEqual([]);
  });

  it('blocks impersonation when audit context is incomplete', () => {
    const blocked = canImpersonate(
      {
        actorRole: 'support',
        ticketId: '12',
        reason: 'check',
      },
      {
        ...enterpriseTenant,
        supportImpersonationEnabled: false,
      },
    );

    expect(blocked.allowed).toBe(false);
    expect(blocked.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('marks enterprise readiness complete when tenant meets white-label and identity requirements', () => {
    const readiness = assessEnterpriseReadiness(enterpriseTenant);

    expect(readiness.ready).toBe(true);
    expect(readiness.deploymentReady).toBe(true);
    expect(readiness.identityReady).toBe(true);
    expect(readiness.brandIsolationReady).toBe(true);
    expect(readiness.findings).toEqual([]);
  });

  it('produces findings when enterprise controls are incomplete', () => {
    const readiness = assessEnterpriseReadiness({
      ...enterpriseTenant,
      customDomain: false,
      ssoReady: false,
      scimReady: false,
      aiRoutingPolicy: 'shared_default',
      financeOversightEnabled: false,
      deploymentMode: 'shared',
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.findings).toContain('SSO readiness is incomplete.');
    expect(readiness.findings).toContain('SCIM readiness is incomplete.');
    expect(readiness.findings).toContain('White-label tenant requires custom domain readiness.');
    expect(readiness.findings).toContain('Enterprise tenant should not rely on shared default AI routing.');
    expect(readiness.findings).toContain('Finance oversight should be enabled for enterprise governance.');
  });

  it('builds governance snapshots and portfolio rollups', () => {
    const snapshot = buildTenantGovernanceSnapshot(enterpriseTenant, featureFlags, healthSignals);

    expect(snapshot.activeFeatureFlags).toEqual(['advanced-routing']);
    expect(snapshot.pilotFeatureFlags).toEqual(['partner-portal-beta']);
    expect(snapshot.healthSummary.warning).toBe(1);

    const register = buildFeatureGovernanceRegister(
      [enterpriseTenant],
      { [enterpriseTenant.tenantId]: featureFlags },
    );

    expect(register[0].manualOverrideCount).toBe(1);

    const rollup = buildPortfolioHealthRollup([snapshot]);

    expect(rollup.tenantCount).toBe(1);
    expect(rollup.enterpriseReadyCount).toBe(1);
    expect(rollup.warningTenantCount).toBe(1);
    expect(rollup.criticalTenantCount).toBe(0);
  });
});