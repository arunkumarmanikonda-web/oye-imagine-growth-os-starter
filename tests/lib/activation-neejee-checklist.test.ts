import { describe, expect, it } from 'vitest';
import {
  buildNeejeeActivationChecklistSummary,
  neejeeActivationChecklistReady,
} from '../../src/lib/activation/neejee-activation-checklist';

describe('neejee-activation-checklist', () => {
  it('is ready when all Neejee activation checks pass', () => {
    const summary = buildNeejeeActivationChecklistSummary({
      brandName: 'Neejee',
      websiteConnected: true,
      analyticsConnected: true,
      adsConnected: true,
      searchConsoleConnected: true,
      approvalsConfigured: true,
      billingConfigured: true,
      strategyApproved: true,
    });

    expect(summary.ready).toBe(true);
    expect(neejeeActivationChecklistReady(summary)).toBe(true);
  });

  it('lists missing items when Neejee activation is incomplete', () => {
    const summary = buildNeejeeActivationChecklistSummary({
      brandName: 'Neejee',
      websiteConnected: true,
      analyticsConnected: false,
      adsConnected: false,
      searchConsoleConnected: true,
      approvalsConfigured: false,
      billingConfigured: true,
      strategyApproved: false,
    });

    expect(summary.ready).toBe(false);
    expect(summary.missingItems).toContain('analyticsConnected');
    expect(summary.missingItems).toContain('adsConnected');
    expect(summary.missingItems).toContain('approvalsConfigured');
    expect(summary.missingItems).toContain('strategyApproved');
  });
});