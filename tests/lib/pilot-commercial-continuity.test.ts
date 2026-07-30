import { describe, expect, it } from 'vitest';
import { buildCommercialContinuitySummary } from '../../src/lib/pilot/commercial-continuity';

describe('pilot commercial continuity', () => {
  it('marks the pilot blocked when key commercial steps are incomplete', () => {
    const summary = buildCommercialContinuitySummary({
      brandName: 'Neejee',
      onboardingCompleted: true,
      strategyGenerated: true,
      strategyApproved: false,
      contractSigned: false,
      subscriptionActive: false,
      invoiceStatus: 'issued',
      approvalOpenCount: 2,
      auditCoverage: 0.6,
      mediaBalanceAmount: 25000,
      currency: 'INR',
    });

    expect(summary.readyForActivation).toBe(false);
    expect(summary.overallStatus).toBe('blocked');
    expect(summary.blockers).toContain('Contract is not signed');
    expect(summary.blockers).toContain('Invoice is issued but not paid');
  });

  it('marks the pilot ready when all activation conditions are satisfied', () => {
    const summary = buildCommercialContinuitySummary({
      brandName: 'Neejee',
      onboardingCompleted: true,
      strategyGenerated: true,
      strategyApproved: true,
      contractSigned: true,
      subscriptionActive: true,
      invoiceStatus: 'paid',
      approvalOpenCount: 0,
      auditCoverage: 0.9,
      mediaBalanceAmount: 50000,
      currency: 'INR',
    });

    expect(summary.readyForActivation).toBe(true);
    expect(summary.overallStatus).toBe('completed');
    expect(summary.blockers).toHaveLength(0);
  });
});