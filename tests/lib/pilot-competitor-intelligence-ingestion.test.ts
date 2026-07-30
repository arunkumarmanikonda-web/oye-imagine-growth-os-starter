import { describe, expect, it } from 'vitest';
import {
  buildCompetitorLandscapeSummary,
  competitorLandscapeHasWhiteSpace,
} from '../../src/lib/pilot/competitor-intelligence-ingestion';

describe('competitor-intelligence-ingestion', () => {
  it('builds white-space summary from competitor set', () => {
    const summary = buildCompetitorLandscapeSummary({
      brandName: 'Neejee',
      ownStrengths: ['regulated workflows', 'approval-first operations'],
      competitors: [
        {
          name: 'Competitor A',
          positioning: 'performance marketing and dashboards',
          offersAiSearch: true,
          offersPerformanceOps: true,
        },
        {
          name: 'Competitor B',
          positioning: 'creative automation platform',
          offersAiSearch: false,
          offersPerformanceOps: false,
        },
      ],
    });

    expect(summary.strongestCompetitors).toContain('Competitor A');
    expect(summary.parityGaps).toContain('AI search visibility');
    expect(competitorLandscapeHasWhiteSpace(summary)).toBe(true);
  });
});