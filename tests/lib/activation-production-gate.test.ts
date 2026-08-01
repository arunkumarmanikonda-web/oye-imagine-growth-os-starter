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
    expect(productionActivationReady(summary)).toBe(true);
  });

  it('blocks when signoff and provider readiness are incomplete', () => {
    const summary = buildProductionActivationSummary({
      brandName: 'Neejee',
      autonomyMode: 'guardrailed',
      deployment: {
        overallStatus: 'blocked',
        blockerCount: 1,
        blockers: ['workspace branding smoke failed'],
        failedSystems: ['workspace-branding-smoke'],
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
  });
});