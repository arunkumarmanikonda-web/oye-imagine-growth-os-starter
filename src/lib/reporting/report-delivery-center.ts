import type {
  ReportDeliveryCenterInput,
  ReportDeliveryCenterSummary,
} from './final-closeout-types';

export function buildReportDeliveryCenterSummary(
  input: ReportDeliveryCenterInput,
): ReportDeliveryCenterSummary {
  const blockers: string[] = [];

  if (input.recipients.length === 0) blockers.push('recipients missing');
  if (input.reportArtifacts.length === 0) blockers.push('report artifacts missing');
  if (!input.approvalsComplete) blockers.push('approvals incomplete');
  if (!input.scheduleConfigured) blockers.push('schedule not configured');

  return {
    deliveryStatus: blockers.length === 0 ? 'ready' : 'blocked',
    recipientCount: input.recipients.length,
    artifactCount: input.reportArtifacts.length,
    blockers,
  };
}

export function reportDeliveryCenterReady(
  summary: ReportDeliveryCenterSummary,
): boolean {
  return summary.deliveryStatus === 'ready' && summary.blockers.length === 0;
}

export function reportDeliveryCenterSupportsAutomatedCadence(
  summary: ReportDeliveryCenterSummary,
): boolean {
  return Boolean(
    reportDeliveryCenterReady(summary) &&
    summary.recipientCount > 0 &&
    summary.artifactCount > 0,
  );
}

export function reportDeliveryCenterSupportsBatchEClosure(
  summary: ReportDeliveryCenterSummary,
): boolean {
  return Boolean(
    reportDeliveryCenterSupportsAutomatedCadence(summary) &&
    summary.deliveryStatus === 'ready' &&
    summary.recipientCount > 0 &&
    summary.artifactCount > 0,
  );
}
