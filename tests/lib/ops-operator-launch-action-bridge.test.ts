import { describe, expect, it } from 'vitest';
import { buildOperatorLaunchActionBridge } from '../../src/lib/ops/operator-launch-action-bridge';

describe('ops operator launch action bridge', () => {
  it('builds a blocked operator-action summary from commercial evidence', () => {
    const summary = buildOperatorLaunchActionBridge({
      brandName: 'Neejee',
      onboardingCompleted: true,
      strategyGenerated: true,
      strategyApproved: true,
      contractSigned: true,
      subscriptionActive: true,
      invoiceStatus: 'paid',
      approvalOpenCount: 0,
      auditCoverage: 0.95,
      mediaBalanceAmount: 50000,
      currency: 'INR',
      requestedLaunchDate: '2026-08-28',
      commercialReviewStatus: 'blocked',
      providerReadinessStatus: 'blocked',
      activationStatus: 'blocked',
      continuityReady: true,
      sharedBlockers: [
        'Required providers are not production ready',
        'eSign provider not ready',
      ],
      pendingReports: 0,
      pendingCampaigns: 0,
      pendingStrategyTasks: 0,
    });

    expect(summary.operatorQueueCount).toBe(1);
    expect(summary.operatorQueueTypes).toContain('activation');
    expect(summary.highestPriority).toBe('medium');
    expect(summary.activationQueueCount).toBe(1);
    expect(summary.nextBestAction).toBe('Neejee: resolve 2 active blocker(s)');
    expect(summary.nextBestActionOwnerRole).toBe('PROGRAM_MANAGER');
    expect(summary.managedQueueActionable).toBe(true);
    expect(summary.launchReady).toBe(false);
    expect(summary.blockingChecks).toContain('commercial: commercial review');
    expect(summary.blockingChecks).toContain('providers: provider readiness');
    expect(summary.blockingChecks).toContain('activation: activation gate');
  });

  it('builds a ready operator-action summary when all gates pass', () => {
    const summary = buildOperatorLaunchActionBridge({
      brandName: 'Neejee',
      onboardingCompleted: true,
      strategyGenerated: true,
      strategyApproved: true,
      contractSigned: true,
      subscriptionActive: true,
      invoiceStatus: 'paid',
      approvalOpenCount: 0,
      auditCoverage: 0.95,
      mediaBalanceAmount: 50000,
      currency: 'INR',
      requestedLaunchDate: '2026-08-29',
      commercialReviewStatus: 'ready',
      providerReadinessStatus: 'ready',
      activationStatus: 'ready',
      continuityReady: true,
      sharedBlockers: [],
      pendingReports: 0,
      pendingCampaigns: 0,
      pendingStrategyTasks: 0,
    });

    expect(summary.operatorQueueCount).toBe(1);
    expect(summary.operatorQueueTypes).toContain('activation');
    expect(summary.highestPriority).toBe('medium');
    expect(summary.activationQueueCount).toBe(1);
    expect(summary.nextBestAction).toBe('Neejee: continue managed services execution');
    expect(summary.nextBestActionOwnerRole).toBe('ACCOUNT_MANAGER');
    expect(summary.managedQueueActionable).toBe(false);
    expect(summary.launchReady).toBe(true);
    expect(summary.blockingChecks).toHaveLength(0);
  });
});
