import { describe, expect, it } from 'vitest';
import { buildAnalyticsKpiSummary, compareKpiSummaries } from '../../src/lib/reporting/kpi-engine';

describe('reporting kpi engine', () => {
  it('builds a normalized KPI summary', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 45000,
      leads: 200,
      visitors: 5000,
      conversions: 150,
      orders: 90,
    });

    expect(summary.roas).toBe(4.5);
    expect(summary.cpl).toBe(50);
    expect(summary.conversionRate).toBe(0.03);
    expect(summary.averageOrderValue).toBe(500);
  });

  it('compares KPI summaries with rounded deltas', () => {
    const previous = buildAnalyticsKpiSummary({
      periodLabel: '2026-06',
      spend: 8000,
      revenue: 32000,
      leads: 160,
      visitors: 4000,
      conversions: 100,
      orders: 64,
    });

    const current = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 45000,
      leads: 200,
      visitors: 5000,
      conversions: 150,
      orders: 90,
    });

    const delta = compareKpiSummaries(current, previous);

    expect(delta.roasDelta).toBe(0.5);
    expect(delta.cplDelta).toBe(0);
    expect(delta.revenueDelta).toBe(13000);
    expect(delta.leadDelta).toBe(40);
  });
});