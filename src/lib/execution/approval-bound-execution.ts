import type {
  ApprovalBoundExecutionInput,
  ApprovalBoundExecutionSummary,
} from './execution-integration-types';

export function buildApprovalBoundExecutionSummary(
  input: ApprovalBoundExecutionInput,
): ApprovalBoundExecutionSummary {
  const blockers: string[] = [];

  if (!input.publishReady) blockers.push('publish readiness not met');
  if (input.requiresApproval && !input.approvalGranted) blockers.push('approval not granted');
  if (input.spendGuardrailStatus !== 'clear') blockers.push('spend guardrail blocked');

  return {
    decision: blockers.length === 0 ? 'approved' : 'hold',
    blockers,
  };
}

export function approvalBoundExecutionCanRun(
  summary: ApprovalBoundExecutionSummary,
): boolean {
  return summary.decision === 'approved' && summary.blockers.length === 0;
}