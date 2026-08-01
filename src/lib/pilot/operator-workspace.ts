import type {
  CommercialContinuitySummary,
  OperatorWorkItem,
  OperatorWorkspaceInput,
} from './pilot-operating-types';

function activationStageReady(summary: CommercialContinuitySummary): boolean {
  return (
    summary.statuses.onboarding === 'completed' &&
    summary.statuses.strategy === 'completed' &&
    summary.statuses.contract === 'completed' &&
    summary.statuses.subscription === 'completed' &&
    summary.statuses.approvals === 'completed'
  );
}

function collectActivationBlockers(summary: CommercialContinuitySummary): string[] {
  const keywords = ['audit', 'invoice', 'subscription', 'contract', 'activation'];

  return summary.blockers.filter((item) =>
    keywords.some((keyword) => item.toLowerCase().includes(keyword)),
  );
}

export function buildOperatorWorkItems(
  input: OperatorWorkspaceInput,
): OperatorWorkItem[] {
  const items: OperatorWorkItem[] = [];
  const summary = input.summary;

  if (summary.statuses.onboarding !== 'completed') {
    items.push({
      queueType: 'onboarding',
      priority: 'high',
      title: `${input.brandName}: complete onboarding intake`,
      ownerRole: 'CUSTOMER_SUCCESS_MANAGER',
      status: 'open',
      payload: {
        requestedLaunchDate: input.requestedLaunchDate || null,
      },
    });
  }

  if (summary.statuses.strategy !== 'completed') {
    items.push({
      queueType: 'strategy',
      priority: 'high',
      title: `${input.brandName}: finalize strategy artifact`,
      ownerRole: 'STRATEGY_LEAD',
      status: 'open',
      payload: {
        blockers: summary.blockers.filter((item) => item.toLowerCase().includes('strategy')),
      },
    });
  }

  if (summary.statuses.contract !== 'completed') {
    items.push({
      queueType: 'legal',
      priority: 'critical',
      title: `${input.brandName}: complete contract signature`,
      ownerRole: 'LEGAL_OPERATIONS',
      status: 'open',
      payload: {},
    });
  }

  if (
    summary.statuses.subscription !== 'completed' ||
    summary.statuses.invoicing !== 'completed'
  ) {
    items.push({
      queueType: 'billing',
      priority: summary.statuses.invoicing === 'blocked' ? 'critical' : 'high',
      title: `${input.brandName}: complete billing activation`,
      ownerRole: 'FINANCE_OPERATIONS',
      status: 'open',
      payload: {
        invoiceStatus: summary.clientVisibleLedger.invoiceStatus,
        mediaBalanceAmount: summary.clientVisibleLedger.mediaBalanceAmount,
        currency: summary.clientVisibleLedger.currency,
      },
    });
  }

  if (summary.statuses.approvals !== 'completed') {
    items.push({
      queueType: 'approval',
      priority: 'high',
      title: `${input.brandName}: resolve open approvals`,
      ownerRole: 'PROGRAM_MANAGER',
      status: 'open',
      payload: {
        blockers: summary.blockers.filter((item) => item.toLowerCase().includes('approval')),
      },
    });
  }

  const activationBlockers = collectActivationBlockers(summary);

  if (summary.readyForActivation) {
    items.push({
      queueType: 'activation',
      priority: 'medium',
      title: `${input.brandName}: launch pilot activation`,
      ownerRole: 'ACCOUNT_DIRECTOR',
      status: 'open',
      payload: {
        requestedLaunchDate: input.requestedLaunchDate || null,
      },
    });
  } else if (activationStageReady(summary) && activationBlockers.length > 0) {
    items.push({
      queueType: 'activation',
      priority:
        summary.statuses.invoicing === 'blocked' || summary.statuses.audit === 'blocked'
          ? 'critical'
          : 'high',
      title: `${input.brandName}: clear activation blockers`,
      ownerRole: 'ACCOUNT_DIRECTOR',
      status: 'open',
      payload: {
        blockers: activationBlockers,
        nextActions: summary.nextActions,
        requestedLaunchDate: input.requestedLaunchDate || null,
      },
    });
  }

  return items;
}
