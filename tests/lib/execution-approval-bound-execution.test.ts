import { describe, expect, it } from 'vitest';
import {
  approvalBoundExecutionCanRun,
  buildApprovalBoundExecutionSummary,
} from '../../src/lib/execution/approval-bound-execution';

describe('approval-bound-execution', () => {
  it('approves execution when publish readiness and guardrails are clear', () => {
    const summary = buildApprovalBoundExecutionSummary({
      brandName: 'Neejee',
      channel: 'google',
      requiresApproval: true,
      approvalGranted: true,
      spendGuardrailStatus: 'clear',
      publishReady: true,
    });

    expect(summary.decision).toBe('approved');
    expect(approvalBoundExecutionCanRun(summary)).toBe(true);
  });

  it('holds execution when guardrails are blocked', () => {
    const summary = buildApprovalBoundExecutionSummary({
      brandName: 'Neejee',
      channel: 'meta',
      requiresApproval: false,
      approvalGranted: false,
      spendGuardrailStatus: 'blocked',
      publishReady: true,
    });

    expect(summary.decision).toBe('hold');
    expect(summary.blockers).toContain('spend guardrail blocked');
  });
});