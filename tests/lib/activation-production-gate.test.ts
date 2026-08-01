import { describe, expect, it } from 'vitest';
import {
  buildProductionActivationSummary,
  productionActivationReady,
} from '../../src/lib/activation/production-activation-gate';

describe('production-activation-gate', () => {
  it('passes when deployment, providers, and signoffs are ready', () => {
    const summary = buildProductionActivationSummary({
      brandName: 'Neejee',
      autonomyMode: 'approval_based',
      deployment: {
        overallStatus: 'ready',
        blockerCount: 0,
        blockers: [],
        failedSystems: [],
        evidenceBlockers: [],
      },
      providerStatuses: [
        {
          provider: 'google_ads',
          status: 'ready',
          blockers: [],
          readyChecks: ['credentials present'],
        },
      ],
      legalSignoffReady: true,
      financeSignoffReady: true,
    });

    expect(summary.canProceed).toBe(true);
    expect(summary.evidenceBlockers).toEqual([]);
    expect(productionActivationReady(summary)).toBe(true);
  });

  it('blocks when signoff, provider readiness, and commercial evidence are incomplete', () => {
    const summary = buildProductionActivationSummary({
      brandName: 'Neejee',
      autonomyMode: 'guardrailed',
      deployment: {
        overallStatus: 'blocked',
        blockerCount: 2,
        blockers: ['workspace branding smoke failed'],
        failedSystems: ['workspace-branding-smoke'],
        evidenceBlockers: ['KYC verification is incomplete'],
      },
      providerStatuses: [
        {
          provider: 'payment_gateway',
          status: 'partial',
          blockers: ['business verification incomplete'],
          readyChecks: ['credentials present'],
        },
      ],
      legalSignoffReady: false,
      financeSignoffReady: false,
    });

    expect(summary.canProceed).toBe(false);
    expect(summary.blockers).toContain('legal signoff not complete');
    expect(summary.externalDependencies).toContain('legal signoff');
    expect(summary.evidenceBlockers).toContain('KYC verification is incomplete');
    expect(summary.externalDependencies).toContain(
      'commercial evidence: KYC verification is incomplete',
    );
  });
});
