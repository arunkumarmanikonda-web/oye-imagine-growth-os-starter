import { describe, expect, it } from 'vitest';
import { buildOptimizationEscalation, optimizationNeedsImmediateAction } from '../../src/lib/reporting/optimization-escalation';
import type { OptimizationRecommendation } from '../../src/lib/reporting/reporting-types';

describe('reporting optimization escalation', () => {
  it('creates a critical escalation for major risk', () => {
    const recommendations: OptimizationRecommendation[] = [
      {
        channel: 'google_ads',
        priority: 'high',
        recommendationType: 'budget_efficiency_review',
        rationale: 'ROAS low',
        expectedImpact: 'improve efficiency',
      },
      {
        channel: 'google_ads',
        priority: 'high',
        recommendationType: 'lead_cost_reduction',
        rationale: 'CPL high',
        expectedImpact: 'reduce cost',
      },
      {
        channel: 'meta_ads',
        priority: 'high',
        recommendationType: 'conversion_path_improvement',
        rationale: 'CVR low',
        expectedImpact: 'improve CVR',
      },
    ];

    const escalation = buildOptimizationEscalation({
      channel: 'paid_media',
      recommendations,
      activeIncidents: 1,
      spendAtRisk: 60000,
    });

    expect(escalation.severity).toBe('critical');
    expect(optimizationNeedsImmediateAction(escalation)).toBe(true);
  });

  it('creates a low escalation when risk is minimal', () => {
    const escalation = buildOptimizationEscalation({
      channel: 'seo',
      recommendations: [],
      activeIncidents: 0,
      spendAtRisk: 0,
    });

    expect(escalation.severity).toBe('low');
  });
});