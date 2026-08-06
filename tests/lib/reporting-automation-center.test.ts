import { describe, expect, it } from 'vitest';
import {
  buildReportDeliveryCenterSummary,
  reportDeliveryCenterSupportsAutomatedCadence,
} from '../../src/lib/reporting/report-delivery-center';
import {
  buildReportPublicationPlan,
  reportPublicationSupportsMultiFormatDelivery,
} from '../../src/lib/reporting/report-publication';
import {
  buildAnalyticsKpiSummary,
} from '../../src/lib/reporting/kpi-engine';
import {
  buildReportSnapshot,
  reportSnapshotSupportsInterpretiveReporting,
} from '../../src/lib/reporting/report-snapshots';

describe('reporting automation center', () => {
  it('supports automated cadence and interpretive reporting', () => {
    const delivery = buildReportDeliveryCenterSummary({
      brandName: 'Neejee',
      recipients: ['ops@neejee.com', 'growth@neejee.com'],
      reportArtifacts: ['report.pdf', 'report.xlsx'],
      approvalsComplete: true,
      scheduleConfigured: true,
    });

    const publication = buildReportPublicationPlan({
      reportName: 'Neejee weekly report',
      audience: 'internal',
      formats: ['pdf', 'xlsx'],
      approvalStatus: 'approved',
      includesFinancialData: false,
    });

    const kpi = buildAnalyticsKpiSummary({
      periodLabel: '2026-08',
      spend: 15000,
      revenue: 68000,
      leads: 240,
      visitors: 6200,
      conversions: 180,
      orders: 110,
    });

    const snapshot = buildReportSnapshot({
      brandName: 'Neejee',
      periodLabel: '2026-08',
      audience: 'internal',
      summary: kpi,
      topInsights: ['ROAS improved after creative refresh'],
      risks: ['Audience fatigue may appear next week'],
      recommendedActions: ['Scale winning ad set with cap controls'],
    });

    expect(reportDeliveryCenterSupportsAutomatedCadence(delivery)).toBe(true);
    expect(reportPublicationSupportsMultiFormatDelivery(publication)).toBe(true);
    expect(reportSnapshotSupportsInterpretiveReporting(snapshot)).toBe(true);
  });
});