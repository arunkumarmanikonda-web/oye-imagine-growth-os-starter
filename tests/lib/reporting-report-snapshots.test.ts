import { describe, expect, it } from 'vitest';
import { buildAnalyticsKpiSummary } from '../../src/lib/reporting/kpi-engine';
import { buildReportSnapshot, reportSnapshotReady } from '../../src/lib/reporting/report-snapshots';

describe('reporting report snapshots', () => {
  it('builds a report snapshot with summary cards and narrative', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 45000,
      leads: 200,
      visitors: 5000,
      conversions: 150,
      orders: 90,
    });

    const snapshot = buildReportSnapshot({
      brandName: 'Neejee',
      periodLabel: 'July 2026',
      audience: 'client',
      summary,
      topInsights: ['ROAS improved through better conversion intent'],
      risks: ['CPL may rise if broad audiences expand too quickly'],
      recommendedActions: ['Scale high-intent ad groups'],
    });

    expect(snapshot.summaryCards.length).toBe(4);
    expect(snapshot.reportName).toBe('Neejee July 2026 performance');
    expect(snapshot.narrative).toContain('Neejee delivered revenue');
  });

  it('marks a complete snapshot ready', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 45000,
      leads: 200,
      visitors: 5000,
      conversions: 150,
      orders: 90,
    });

    const snapshot = buildReportSnapshot({
      brandName: 'Neejee',
      periodLabel: 'July 2026',
      audience: 'exec',
      summary,
      topInsights: ['Revenue efficiency improved'],
      risks: ['Audience saturation risk'],
      recommendedActions: ['Refresh creatives before scale'],
    });

    expect(reportSnapshotReady(snapshot)).toBe(true);
  });
});