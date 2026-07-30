import type {
  ApprovalEvaluation,
  ApprovalPolicy,
  ApprovalRequestContext,
} from './control-plane-types';

function score(policy: ApprovalPolicy, context: ApprovalRequestContext): number {
  if (policy.scopeType !== context.scopeType) return -1;
  if (!policy.scopeRef) return 1;
  return policy.scopeRef === context.scopeRef ? 2 : -1;
}

export function resolveApprovalPolicy(
  policies: ApprovalPolicy[],
  context: ApprovalRequestContext,
): ApprovalPolicy | null {
  return (
    policies
      .filter((x) => x.isActive)
      .filter((x) => x.tenantId === context.tenantId)
      .filter((x) => x.actionKey === context.actionKey)
      .map((x) => ({ x, s: score(x, context) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)[0]?.x ?? null
  );
}

export function evaluateApprovalRequirement(
  policies: ApprovalPolicy[],
  context: ApprovalRequestContext,
): ApprovalEvaluation {
  const policy = resolveApprovalPolicy(policies, context);
  if (!policy) {
    return { policy: null, approvalRequired: false, reasons: [] };
  }

  const reasons: string[] = [];
  let approvalRequired = policy.minApprovers > 0;

  if (policy.makerCheckerRequired) {
    approvalRequired = true;
    reasons.push('maker_checker');
  }

  if (
    typeof context.amount === 'number' &&
    typeof policy.maxAmount === 'number' &&
    context.amount > policy.maxAmount
  ) {
    approvalRequired = true;
    reasons.push('amount_threshold_exceeded');
  }

  if (
    typeof context.deltaPercent === 'number' &&
    typeof policy.maxDeltaPercent === 'number' &&
    Math.abs(context.deltaPercent) > policy.maxDeltaPercent
  ) {
    approvalRequired = true;
    reasons.push('delta_threshold_exceeded');
  }

  if (approvalRequired && reasons.length === 0) {
    reasons.push('policy_requires_approval');
  }

  return { policy, approvalRequired, reasons };
}

export function approvalSatisfied(
  policy: ApprovalPolicy | null,
  makerUserId: string,
  approverUserIds: string[],
): boolean {
  if (!policy || !policy.isActive) return true;

  const uniqueApprovers = [...new Set(approverUserIds.filter(Boolean))];
  if (policy.makerCheckerRequired && uniqueApprovers.includes(makerUserId)) {
    return false;
  }

  const min = Math.max(policy.minApprovers, policy.makerCheckerRequired ? 1 : 0);
  return uniqueApprovers.length >= min;
}