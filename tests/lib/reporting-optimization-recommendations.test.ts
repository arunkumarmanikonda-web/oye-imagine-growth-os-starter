import { describe, expect, it } from 'vitest';
import { buildAnalyticsKpiSummary } from '../../src/lib/reporting/kpi-engine';
import {
  buildOptimizationRecommendations,
  hasHighPriorityRecommendation,
} from '../../src/lib/reporting/optimization-recommendations';

describe('reporting optimization recommendations', () => {
  it('creates high-priority recommendations when efficiency is below target', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 15000,
      leads: 50,
      visitors: 4000,
      conversions: 40,
      orders: 20,
    });

    const recommendations = buildOptimizationRecommendations({
      channel: 'google_ads',
      summary,
      targetRoas: 3,
      targetConversionRate: 0.02,
      maxCpl: 150,
    });

    expect(hasHighPriorityRecommendation(recommendations)).toBe(true);
    expect(recommendations.map((item) => item.recommendationType)).toContain('budget_efficiency_review');
  });

  it('creates a scale recommendation when metrics meet targets', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 50000,
      leads: 200,
      visitors: 4000,
      conversions: 120,
      orders: 100,
    });

    const recommendations = buildOptimizationRecommendations({
      channel: 'meta_ads',
      summary,
      targetRoas: 3,
      targetConversionRate: 0.02,
      maxCpl: 100,
    });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.recommendationType).toBe('scale_winning_segments');
  });
});