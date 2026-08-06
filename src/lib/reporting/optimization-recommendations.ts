import type {
  OptimizationContext,
  OptimizationRecommendation,
  RecommendationPriority,
} from './reporting-types';

function recommendation(
  channel: string,
  priority: RecommendationPriority,
  recommendationType: string,
  rationale: string,
  expectedImpact: string,
): OptimizationRecommendation {
  return {
    channel,
    priority,
    recommendationType,
    rationale,
    expectedImpact,
  };
}

export function buildOptimizationRecommendations(
  context: OptimizationContext,
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  if (context.summary.roas < context.targetRoas) {
    recommendations.push(
      recommendation(
        context.channel,
        'high',
        'budget_efficiency_review',
        `ROAS ${context.summary.roas.toFixed(2)} is below target ${context.targetRoas.toFixed(2)}.`,
        'Reduce wasted spend and reallocate budget toward higher-intent segments.',
      ),
    );
  }

  if (context.summary.cpl > context.maxCpl) {
    recommendations.push(
      recommendation(
        context.channel,
        'high',
        'lead_cost_reduction',
        `CPL ${context.summary.cpl.toFixed(2)} is above max threshold ${context.maxCpl.toFixed(2)}.`,
        'Tighten targeting and refresh creative hooks to improve lead efficiency.',
      ),
    );
  }

  if (context.summary.conversionRate < context.targetConversionRate) {
    recommendations.push(
      recommendation(
        context.channel,
        'medium',
        'conversion_path_improvement',
        `Conversion rate ${context.summary.conversionRate.toFixed(2)} is below target ${context.targetConversionRate.toFixed(2)}.`,
        'Improve landing page clarity, trust signals, and CTA sequencing.',
      ),
    );
  }

  if (
    context.summary.roas >= context.targetRoas &&
    context.summary.conversionRate >= context.targetConversionRate
  ) {
    recommendations.push(
      recommendation(
        context.channel,
        'low',
        'scale_winning_segments',
        'Performance is at or above target across efficiency and conversion metrics.',
        'Scale validated audiences and preserve current winning creative patterns.',
      ),
    );
  }

  return recommendations;
}

export function hasHighPriorityRecommendation(
  recommendations: OptimizationRecommendation[],
): boolean {
  return recommendations.some((item) => item.priority === 'high');
}

export function optimizationRecommendationsSupportExperimentation(
  recommendations: OptimizationRecommendation[],
): boolean {
  return Boolean(
    recommendations.length > 0 &&
    recommendations.every((item) => Boolean(item.channel && item.recommendationType && item.expectedImpact))
  );
}
