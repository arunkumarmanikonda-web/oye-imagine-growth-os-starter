import type {
  SearchOptimizationBrief,
  SearchOptimizationInput,
} from './execution-governance-types';

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildSearchOptimizationBrief(
  input: SearchOptimizationInput,
): SearchOptimizationBrief {
  const supportingQueries = unique([
    `${input.primaryTopic} for ${input.audience}`,
    `${input.offer} ${input.primaryTopic}`,
    ...input.supportingKeywords,
  ]);

  const answerEntities = unique([
    input.brandName,
    input.offer,
    ...input.differentiators,
  ]);

  const schemaRecommendations =
    input.targetSurface === 'seo'
      ? ['Organization', 'FAQPage', 'BreadcrumbList']
      : input.targetSurface === 'aeo'
        ? ['FAQPage', 'HowTo']
        : input.targetSurface === 'geo'
          ? ['LocalBusiness', 'FAQPage']
          : ['FAQPage', 'Organization'];

  const zeroClickOpportunities = unique([
    `direct answer for ${input.primaryTopic}`,
    `comparison snippet for ${input.offer}`,
    `brand summary for ${input.brandName}`,
  ]);

  return {
    briefName: `${input.brandName} ${input.targetSurface} ${input.primaryTopic}`,
    targetSurface: input.targetSurface,
    primaryQuery: `${input.primaryTopic} for ${input.audience}`,
    supportingQueries,
    answerEntities,
    schemaRecommendations,
    zeroClickOpportunities,
  };
}

export function searchOptimizationReady(
  brief: SearchOptimizationBrief,
): boolean {
  return Boolean(
    brief.primaryQuery &&
    brief.supportingQueries.length >= 3 &&
    brief.answerEntities.length >= 2 &&
    brief.schemaRecommendations.length >= 1,
  );
}

export function searchOptimizationSupportsDiscoverabilitySystem(
  brief: SearchOptimizationBrief,
): boolean {
  return Boolean(
    ['seo', 'aeo', 'geo', 'ai_search'].includes(brief.targetSurface) &&
    brief.supportingQueries.length >= 3 &&
    brief.answerEntities.length >= 2 &&
    brief.zeroClickOpportunities.length >= 3 &&
    brief.schemaRecommendations.length >= 1
  );
}
