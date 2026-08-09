import type {
  ExperimentDefinition,
  ExperimentSummary,
} from './reporting-types';

export function buildExperimentSummary(
  input: ExperimentDefinition,
): ExperimentSummary {
  return {
    experimentId: input.experimentId,
    experimentType: input.experimentType,
    surface: input.surface,
    variantCount: input.variants.length,
    outcome: input.outcome,
    confidence: input.confidence,
    ready: Boolean(
      input.experimentId &&
      input.tenantId &&
      input.workspaceId &&
      input.hypothesis &&
      input.primaryMetric &&
      input.variants.length >= 2,
    ),
  };
}

export function experimentSummaryReady(
  summary: ExperimentSummary,
): boolean {
  return Boolean(
    summary.ready &&
    summary.variantCount >= 2 &&
    summary.experimentId &&
    summary.surface,
  );
}

export function experimentSummarySupportsLearningLoop(
  summary: ExperimentSummary,
): boolean {
  return Boolean(
    experimentSummaryReady(summary) &&
    ['pending', 'win', 'loss', 'inconclusive'].includes(summary.outcome) &&
    ['low', 'medium', 'high'].includes(summary.confidence),
  );
}

export function experimentSummarySupportsBatchEClosure(
  summary: ExperimentSummary,
): boolean {
  return Boolean(
    experimentSummarySupportsLearningLoop(summary) &&
    ['win', 'loss', 'inconclusive', 'pending'].includes(summary.outcome),
  );
}
