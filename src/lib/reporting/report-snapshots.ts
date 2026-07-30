import type { ReportSnapshot, ReportSnapshotInput } from './reporting-types';

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export function buildReportSnapshot(input: ReportSnapshotInput): ReportSnapshot {
  return {
    reportName: `${input.brandName} ${input.periodLabel} performance`,
    audience: input.audience,
    summaryCards: [
      { label: 'ROAS', value: formatDecimal(input.summary.roas) },
      { label: 'CPL', value: formatDecimal(input.summary.cpl) },
      { label: 'Conversion Rate', value: formatDecimal(input.summary.conversionRate) },
      { label: 'Revenue', value: formatDecimal(input.summary.revenue) },
    ],
    narrative: `${input.brandName} delivered revenue ${formatDecimal(input.summary.revenue)} from spend ${formatDecimal(input.summary.spend)} with ROAS ${formatDecimal(input.summary.roas)} and conversion rate ${formatDecimal(input.summary.conversionRate)} during ${input.periodLabel}.`,
    topInsights: input.topInsights,
    risks: input.risks,
    recommendedActions: input.recommendedActions,
  };
}

export function reportSnapshotReady(snapshot: ReportSnapshot): boolean {
  return Boolean(
    snapshot.reportName &&
    snapshot.summaryCards.length >= 4 &&
    snapshot.narrative.length >= 50 &&
    snapshot.topInsights.length > 0 &&
    snapshot.recommendedActions.length > 0,
  );
}