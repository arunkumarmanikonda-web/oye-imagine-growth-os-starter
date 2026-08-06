import type {
  AttributionInput,
  AttributionModel,
  AttributionSummary,
} from './reporting-types';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveModelWeight(model: AttributionModel): number {
  switch (model) {
    case 'first_touch':
      return 1.0;
    case 'last_touch':
      return 1.0;
    case 'linear':
      return 1.0;
    case 'time_decay':
      return 0.92;
    case 'position_based':
      return 0.95;
    case 'custom':
      return 0.9;
    default:
      return 1.0;
  }
}

export function buildAttributionSummary(
  input: AttributionInput,
): AttributionSummary {
  const weight = resolveModelWeight(input.model);

  return {
    model: input.model,
    periodLabel: input.periodLabel,
    attributedConversions: round2(input.conversions * weight),
    attributedRevenue: round2(input.revenue * weight),
    confidence: input.confidence,
    freshnessHours: input.freshnessHours,
    limitations: input.limitations,
    ready: Boolean(
      input.periodLabel &&
      input.touchpoints > 0 &&
      input.conversions >= 0 &&
      input.revenue >= 0 &&
      input.limitations.length > 0,
    ),
  };
}

export function attributionSummaryReady(
  summary: AttributionSummary,
): boolean {
  return Boolean(
    summary.ready &&
    summary.periodLabel &&
    summary.attributedConversions >= 0 &&
    summary.attributedRevenue >= 0,
  );
}

export function attributionSummaryHasDisclosure(
  summary: AttributionSummary,
): boolean {
  return Boolean(
    summary.limitations.length > 0 &&
    summary.freshnessHours >= 0 &&
    ['low', 'medium', 'high'].includes(summary.confidence),
  );
}