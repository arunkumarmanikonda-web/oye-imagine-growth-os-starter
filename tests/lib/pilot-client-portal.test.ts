import { describe, expect, it } from 'vitest';
import { buildCommercialContinuitySummary } from '../../src/lib/pilot/commercial-continuity';
import { buildClientPortalSnapshot } from '../../src/lib/pilot/client-portal';

describe('pilot client portal snapshot', () => {
  it('builds a strategy-phase portal snapshot when strategy is not approved', () => {
    const summary = buildCommercialContinuitySummary({
      brandName: 'Neejee',
      onboardingCompleted: true,
      strategyGenerated: true,
      strategyApproved: false,
      contractSigned: false,
      subscriptionActive: false,
      invoiceStatus: 'not_issued',
      approvalOpenCount: 0,
      auditCoverage: 0.85,
      mediaBalanceAmount: 0,
      currency: 'INR',
    });

    const snapshot = buildClientPortalSnapshot(summary);

    expect(snapshot.phase).toBe('strategy');
    expect(snapshot.readinessScore).toBeGreaterThan(0);
    expect(snapshot.clientAlerts.length).toBeGreaterThan(0);
  });

  it('builds a live portal snapshot when activation is ready', () => {
    const summary = buildCommercialContinuitySummary({
      brandName: 'Neejee',
      onboardingCompleted: true,
      strategyGenerated: true,
      strategyApproved: true,
      contractSigned: true,
      subscriptionActive: true,
      invoiceStatus: 'paid',
      approvalOpenCount: 0,
      auditCoverage: 0.95,
      mediaBalanceAmount: 80000,
      currency: 'INR',
    });

    const snapshot = buildClientPortalSnapshot(summary);

    expect(snapshot.phase).toBe('live');
    expect(snapshot.readinessScore).toBe(100);
  });
});