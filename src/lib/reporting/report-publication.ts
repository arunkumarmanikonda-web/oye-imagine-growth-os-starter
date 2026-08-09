import type {
  ReportPublicationInput,
  ReportPublicationPlan,
} from './closeout-types';

export function buildReportPublicationPlan(
  input: ReportPublicationInput,
): ReportPublicationPlan {
  const blockedReasons: string[] = [];

  if (input.approvalStatus !== 'approved') {
    blockedReasons.push('report approval is incomplete');
  }

  if (input.includesFinancialData && input.audience === 'client' && input.approvalStatus !== 'approved') {
    blockedReasons.push('financial client reports require approval');
  }

  const jobs = input.formats.map((format) => {
    if (blockedReasons.length > 0) {
      return {
        format,
        targetAudience: input.audience,
        decision: 'approval_required' as const,
        requiresApproval: true,
      };
    }

    return {
      format,
      targetAudience: input.audience,
      decision: 'ready' as const,
      requiresApproval: false,
    };
  });

  return {
    jobs,
    blockedReasons,
    ready: blockedReasons.length === 0,
  };
}

export function reportPublicationReady(
  plan: ReportPublicationPlan,
): boolean {
  return plan.ready &&
    plan.jobs.length > 0 &&
    plan.jobs.every((job) => job.decision === 'ready');
}

export function reportPublicationSupportsMultiFormatDelivery(
  plan: ReportPublicationPlan,
): boolean {
  const readyFormats = plan.jobs.filter((job) => job.decision === 'ready').map((job) => job.format);
  return Boolean(
    reportPublicationReady(plan) &&
    readyFormats.length >= 2
  );
}

export function reportPublicationSupportsBatchEClosure(
  plan: ReportPublicationPlan,
): boolean {
  return Boolean(
    reportPublicationSupportsMultiFormatDelivery(plan) &&
    plan.jobs.length > 0 &&
    plan.jobs.every((job) => job.decision === 'ready'),
  );
}
