import type {
  CommercialContinuityInput,
  CommercialContinuitySummary,
  PilotWorkflowStatus,
} from './pilot-operating-types';

function blockedOrCompleted(value: boolean): PilotWorkflowStatus {
  return value ? 'completed' : 'blocked';
}

function invoiceToWorkflowStatus(
  status: CommercialContinuityInput['invoiceStatus'],
): PilotWorkflowStatus {
  switch (status) {
    case 'paid':
      return 'completed';
    case 'issued':
      return 'in_progress';
    case 'overdue':
      return 'blocked';
    case 'not_issued':
    default:
      return 'not_started';
  }
}

function auditToWorkflowStatus(coverage: number): PilotWorkflowStatus {
  if (coverage >= 0.8) {
    return 'completed';
  }

  if (coverage >= 0.5) {
    return 'in_progress';
  }

  return 'blocked';
}

export function buildCommercialContinuitySummary(
  input: CommercialContinuityInput,
): CommercialContinuitySummary {
  const statuses = {
    onboarding: input.onboardingCompleted ? 'completed' : 'in_progress',
    strategy: input.strategyApproved
      ? 'completed'
      : input.strategyGenerated
        ? 'ready'
        : 'in_progress',
    contract: blockedOrCompleted(input.contractSigned),
    subscription: blockedOrCompleted(input.subscriptionActive),
    invoicing: invoiceToWorkflowStatus(input.invoiceStatus),
    approvals: input.approvalOpenCount === 0 ? 'completed' : 'blocked',
    audit: auditToWorkflowStatus(input.auditCoverage),
  } as const;

  const blockers: string[] = [];
  const nextActions: string[] = [];

  if (!input.onboardingCompleted) {
    blockers.push('Onboarding information is incomplete');
    nextActions.push('Complete tenant onboarding inputs');
  }

  if (!input.strategyGenerated) {
    blockers.push('Strategy artifact has not been generated');
    nextActions.push('Generate the strategy artifact');
  } else if (!input.strategyApproved) {
    blockers.push('Strategy artifact is awaiting approval');
    nextActions.push('Approve the strategy artifact');
  }

  if (!input.contractSigned) {
    blockers.push('Contract is not signed');
    nextActions.push('Send or complete contract signature');
  }

  if (!input.subscriptionActive) {
    blockers.push('Subscription is not active');
    nextActions.push('Activate the subscription');
  }

  if (input.invoiceStatus === 'not_issued') {
    blockers.push('Invoice has not been issued');
    nextActions.push('Issue the initial invoice');
  } else if (input.invoiceStatus === 'issued') {
    blockers.push('Invoice is issued but not paid');
    nextActions.push('Collect payment or confirm remittance');
  } else if (input.invoiceStatus === 'overdue') {
    blockers.push('Invoice is overdue');
    nextActions.push('Resolve overdue invoice before activation');
  }

  if (input.approvalOpenCount > 0) {
    blockers.push(`There are ${input.approvalOpenCount} open approval item(s)`);
    nextActions.push('Resolve all open approval items');
  }

  if (input.auditCoverage < 0.8) {
    blockers.push('Audit coverage is below activation threshold');
    nextActions.push('Complete website, brand, and competitor audit coverage');
  }

  const readyForActivation =
    input.onboardingCompleted &&
    input.strategyApproved &&
    input.contractSigned &&
    input.subscriptionActive &&
    input.invoiceStatus === 'paid' &&
    input.approvalOpenCount === 0 &&
    input.auditCoverage >= 0.8;

  return {
    brandName: input.brandName,
    overallStatus: readyForActivation ? 'completed' : blockers.length > 0 ? 'blocked' : 'in_progress',
    readyForActivation,
    statuses,
    blockers,
    nextActions,
    clientVisibleLedger: {
      mediaBalanceAmount: input.mediaBalanceAmount,
      currency: input.currency,
      invoiceStatus: input.invoiceStatus,
    },
  };
}