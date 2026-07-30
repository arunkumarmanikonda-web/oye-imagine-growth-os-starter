import { describe, expect, it } from 'vitest';
import { buildCommercialContinuitySummary } from '../../src/lib/pilot/commercial-continuity';
import { buildOperatorWorkItems } from '../../src/lib/pilot/operator-workspace';

describe('pilot operator workspace', () => {
  it('creates operator queue items for blocked commercial continuity', () => {
    const summary = buildCommercialContinuitySummary({
      brandName: 'Neejee',
      onboardingCompleted: false,
      strategyGenerated: false,
      strategyApproved: false,
      contractSigned: false,
      subscriptionActive: false,
      invoiceStatus: 'overdue',
      approvalOpenCount: 1,
      auditCoverage: 0.4,
      mediaBalanceAmount: 10000,
      currency: 'INR',
    });

    const items = buildOperatorWorkItems({
      brandName: 'Neejee',
      summary,
      requestedLaunchDate: '2026-08-15',
    });

    expect(items.some((item) => item.queueType === 'onboarding')).toBe(true);
    expect(items.some((item) => item.queueType === 'legal')).toBe(true);
    expect(items.some((item) => item.queueType === 'billing')).toBe(true);
    expect(items.some((item) => item.queueType === 'approval')).toBe(true);
  });

  it('creates an activation item when the pilot is ready', () => {
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
      mediaBalanceAmount: 60000,
      currency: 'INR',
    });

    const items = buildOperatorWorkItems({
      brandName: 'Neejee',
      summary,
      requestedLaunchDate: '2026-08-20',
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.queueType).toBe('activation');
  });
});