import type {
  PublishGuardrailDecision,
  PublishGuardrailInput,
} from './execution-governance-types';

export function decidePublishGuardrail(
  input: PublishGuardrailInput,
): PublishGuardrailDecision {
  const reasons: string[] = [];

  if (input.requestedAction === 'draft') {
    return {
      decision: 'draft_only',
      requiresApproval: false,
      reasons: ['draft actions are always allowed'],
    };
  }

  if (!input.channelAutomationSupported) {
    reasons.push('channel automation is not supported');
  }

  if (!input.commercialReady) {
    reasons.push('commercial activation is not ready');
  }

  if (input.approvalStatus !== 'approved') {
    reasons.push('asset approval is incomplete');
  }

  if (input.approvalsOpenCount > 0) {
    reasons.push(`there are ${input.approvalsOpenCount} open approvals`);
  }

  if (input.estimatedSpend > 25000) {
    reasons.push('estimated spend exceeds auto-publish threshold');
  }

  if (input.requestedAction === 'export') {
    if (reasons.length === 0) {
      return {
        decision: 'export_only',
        requiresApproval: false,
        reasons: ['export allowed'],
      };
    }

    return {
      decision: 'approval_required',
      requiresApproval: true,
      reasons,
    };
  }

  if (input.requestedAction === 'publish') {
    if (!input.channelAutomationSupported || !input.commercialReady) {
      return {
        decision: 'blocked',
        requiresApproval: true,
        reasons,
      };
    }

    if (reasons.length > 0) {
      return {
        decision: 'approval_required',
        requiresApproval: true,
        reasons,
      };
    }

    return {
      decision: 'publish_allowed',
      requiresApproval: false,
      reasons: ['publish allowed'],
    };
  }

  return {
    decision: 'blocked',
    requiresApproval: true,
    reasons: ['unsupported action'],
  };
}