import type {
  ClientPortalSnapshot,
  CommercialContinuitySummary,
  PortalPhase,
} from './pilot-operating-types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function resolvePhase(summary: CommercialContinuitySummary): PortalPhase {
  if (summary.readyForActivation) {
    return 'live';
  }

  if (summary.statuses.onboarding !== 'completed') {
    return 'onboarding';
  }

  if (summary.statuses.strategy !== 'completed') {
    return 'strategy';
  }

  if (summary.statuses.contract !== 'completed') {
    return 'contracting';
  }

  return 'activation';
}

export function buildClientPortalSnapshot(
  summary: CommercialContinuitySummary,
): ClientPortalSnapshot {
  const completedCount = Object.values(summary.statuses).filter(
    (status) => status === 'completed',
  ).length;

  const readinessScore = clamp(Math.round((completedCount / 7) * 100), 0, 100);
  const phase = resolvePhase(summary);

  return {
    brandName: summary.brandName,
    phase,
    headline: summary.readyForActivation
      ? `${summary.brandName} is ready for pilot activation`
      : `${summary.brandName} is progressing through ${phase}`,
    readinessScore,
    workflowStatus: summary.statuses,
    clientAlerts: summary.blockers,
    nextActions: summary.nextActions,
    financialOverview: {
      mediaBalanceAmount: summary.clientVisibleLedger.mediaBalanceAmount,
      currency: summary.clientVisibleLedger.currency,
      invoiceStatus: summary.clientVisibleLedger.invoiceStatus,
    },
  };
}