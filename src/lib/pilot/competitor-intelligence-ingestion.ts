import type {
  CompetitorLandscapeInput,
  CompetitorLandscapeSummary,
} from './pilot-integration-types';

export function buildCompetitorLandscapeSummary(
  input: CompetitorLandscapeInput,
): CompetitorLandscapeSummary {
  const strongestCompetitors = input.competitors
    .filter((competitor) => competitor.offersAiSearch || competitor.offersPerformanceOps)
    .map((competitor) => competitor.name);

  const parityGaps: string[] = [];
  if (input.competitors.some((competitor) => competitor.offersAiSearch)) {
    parityGaps.push('AI search visibility');
  }
  if (input.competitors.some((competitor) => competitor.offersPerformanceOps)) {
    parityGaps.push('managed performance operations');
  }

  const whiteSpace: string[] = [];
  if (!input.competitors.some((competitor) => competitor.positioning.toLowerCase().includes('approval'))) {
    whiteSpace.push('approval-bound marketing operations');
  }
  if (!input.competitors.some((competitor) => competitor.positioning.toLowerCase().includes('commercial'))) {
    whiteSpace.push('commercial workflow + marketing OS linkage');
  }
  if (input.ownStrengths.some((strength) => strength.toLowerCase().includes('regulated'))) {
    whiteSpace.push('regulated-service operating model');
  }

  return {
    strongestCompetitors,
    parityGaps,
    whiteSpace,
  };
}

export function competitorLandscapeHasWhiteSpace(
  summary: CompetitorLandscapeSummary,
): boolean {
  return summary.whiteSpace.length > 0;
}

export function competitorLandscapeNeedsExpansion(
  summary: CompetitorLandscapeSummary,
): boolean {
  return summary.strongestCompetitors.length === 0 || summary.parityGaps.length > 0
}
