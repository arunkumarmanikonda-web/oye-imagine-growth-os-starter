import { describe, expect, it } from 'vitest';
import { decidePublishGuardrail } from '../../src/lib/execution/publish-guardrails';

describe('execution publish guardrails', () => {
  it('allows publish when governance conditions are satisfied', () => {
    const decision = decidePublishGuardrail({
      channel: 'meta_ads',
      requestedAction: 'publish',
      commercialReady: true,
      approvalStatus: 'approved',
      approvalsOpenCount: 0,
      estimatedSpend: 10000,
      channelAutomationSupported: true,
    });

    expect(decision.decision).toBe('publish_allowed');
    expect(decision.requiresApproval).toBe(false);
  });

  it('requires approval or blocks when governance conditions fail', () => {
    const decision = decidePublishGuardrail({
      channel: 'google_ads',
      requestedAction: 'publish',
      commercialReady: false,
      approvalStatus: 'draft',
      approvalsOpenCount: 2,
      estimatedSpend: 50000,
      channelAutomationSupported: false,
    });

    expect(['approval_required', 'blocked']).toContain(decision.decision);
    expect(decision.requiresApproval).toBe(true);
    expect(decision.reasons.length).toBeGreaterThan(0);
  });
});