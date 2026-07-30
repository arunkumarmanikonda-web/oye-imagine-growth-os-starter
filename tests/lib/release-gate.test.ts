import { describe, expect, it } from 'vitest';
import { summarizeHealthChecks, assessUsageSnapshot, summarizeLaunchReadiness } from '../../src/lib/ops';
import { buildReleaseGateSummary, releaseGateReady } from '../../src/lib/release/release-gate';

describe('release gate', () => {
  it('returns go when validation, health, launch, and usage all pass', () => {
    const health = summarizeHealthChecks([
      {
        component: 'supabase',
        environment: 'production',
        status: 'healthy',
        severity: 'info',
        message: 'healthy',
        detectedAt: '2026-07-30T12:00:00Z',
      },
    ]);

    const launch = summarizeLaunchReadiness([
      { category: 'security', checkName: 'rbac review', status: 'pass' },
      { category: 'operations', checkName: 'backup restore test', status: 'pass' },
      { category: 'compliance', checkName: 'dpdp controls', status: 'pass' },
    ]);

    const usage = [
      assessUsageSnapshot({
        tenantId: 'tenant_neejee',
        snapshotPeriod: '2026-07',
        aiTokensUsed: 150000,
        aiCostAmount: 700,
        contentItemsGenerated: 70,
        campaignsExported: 6,
        reportsGenerated: 5,
        quotaLimit: {
          aiCostAmount: 1000,
          contentItemsGenerated: 100,
          campaignsExported: 10,
          reportsGenerated: 10,
        },
      }),
    ];

    const summary = buildReleaseGateSummary({
      environment: 'production',
      health,
      launch,
      usage,
      validationSuitesPassed: 18,
      validationSuitesFailed: 0,
    });

    expect(summary.decision).toBe('go');
    expect(summary.blockers).toHaveLength(0);
    expect(releaseGateReady(summary)).toBe(true);
  });

  it('returns hold when critical blockers exist', () => {
    const health = summarizeHealthChecks([
      {
        component: 'ai-gateway',
        environment: 'production',
        status: 'down',
        severity: 'critical',
        message: 'down',
        detectedAt: '2026-07-30T12:00:00Z',
      },
    ]);

    const launch = summarizeLaunchReadiness([
      { category: 'operations', checkName: 'backup restore test', status: 'fail' },
    ]);

    const usage = [
      assessUsageSnapshot({
        tenantId: 'tenant_neejee',
        snapshotPeriod: '2026-07',
        aiTokensUsed: 300000,
        aiCostAmount: 1400,
        contentItemsGenerated: 120,
        campaignsExported: 12,
        reportsGenerated: 11,
        quotaLimit: {
          aiCostAmount: 1000,
          contentItemsGenerated: 100,
          campaignsExported: 10,
          reportsGenerated: 10,
        },
      }),
    ];

    const summary = buildReleaseGateSummary({
      environment: 'production',
      health,
      launch,
      usage,
      validationSuitesPassed: 18,
      validationSuitesFailed: 2,
    });

    expect(summary.decision).toBe('hold');
    expect(summary.blockers.length).toBeGreaterThan(0);
    expect(releaseGateReady(summary)).toBe(false);
  });
});