import { describe, expect, it } from 'vitest';
import {
  buildDeliveryLifecycleSummary,
  deliveryLifecycleReady,
} from '../../src/lib/marketplace/delivery-lifecycle';

describe('marketplace delivery lifecycle', () => {
  it('requires proposal acceptance before assignment', () => {
    const summary = buildDeliveryLifecycleSummary({
      requestStatus: 'proposed',
      acceptedProposal: false,
      milestonesTotal: 3,
      milestonesCompleted: 0,
      revisionsOpen: 0,
      disputeOpen: false,
      payoutApproved: false,
    });

    expect(summary.stage).toBe('proposal');
    expect(summary.nextBestAction).toBe('accept proposal and assign specialist');
    expect(deliveryLifecycleReady(summary)).toBe(false);
  });

  it('tracks delivery while milestones remain', () => {
    const summary = buildDeliveryLifecycleSummary({
      requestStatus: 'in_delivery',
      acceptedProposal: true,
      milestonesTotal: 4,
      milestonesCompleted: 2,
      revisionsOpen: 0,
      disputeOpen: false,
      payoutApproved: false,
    });

    expect(summary.stage).toBe('delivery');
    expect(summary.nextBestAction).toBe('complete 2 remaining milestone(s)');
    expect(deliveryLifecycleReady(summary)).toBe(false);
  });

  it('blocks closeout when revisions or disputes remain', () => {
    const summary = buildDeliveryLifecycleSummary({
      requestStatus: 'in_delivery',
      acceptedProposal: true,
      milestonesTotal: 3,
      milestonesCompleted: 3,
      revisionsOpen: 1,
      disputeOpen: true,
      payoutApproved: false,
    });

    expect(summary.blockers).toContain('revision pending');
    expect(summary.blockers).toContain('dispute open');
    expect(deliveryLifecycleReady(summary)).toBe(false);
  });

  it('marks lifecycle ready when milestones complete and payout readiness is approved', () => {
    const summary = buildDeliveryLifecycleSummary({
      requestStatus: 'accepted',
      acceptedProposal: true,
      milestonesTotal: 2,
      milestonesCompleted: 2,
      revisionsOpen: 0,
      disputeOpen: false,
      payoutApproved: true,
    });

    expect(summary.stage).toBe('acceptance');
    expect(deliveryLifecycleReady(summary)).toBe(true);
  });
});