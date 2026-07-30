import { describe, expect, it } from 'vitest';
import {
  extractTopWhitespace,
  normalizeCompetitorName,
  rankCompetitorsByThreat,
} from '../../src/lib/pilot/competitor-intelligence';

describe('pilot competitor intelligence', () => {
  const snapshots = [
    {
      competitorName: ' Competitor A ',
      relationshipType: 'direct' as const,
      threatScore: 90,
      channelStrength: { seo: 90, paid: 85 },
      whitespaceOpportunities: ['founder storytelling', 'artisan provenance'],
    },
    {
      competitorName: 'Competitor B',
      relationshipType: 'aspirational' as const,
      threatScore: 75,
      channelStrength: { seo: 95, paid: 60 },
      whitespaceOpportunities: ['artisan provenance', 'quiet luxury positioning'],
    },
  ];

  it('normalizes competitor names', () => {
    expect(normalizeCompetitorName('  Competitor   A  ')).toBe('Competitor A');
  });

  it('ranks by threat score', () => {
    const ranked = rankCompetitorsByThreat(snapshots);
    expect(ranked[0].competitorName.trim()).toBe('Competitor A');
  });

  it('extracts repeated whitespace opportunities', () => {
    const whitespace = extractTopWhitespace(snapshots, 2);
    expect(whitespace[0]).toBe('artisan provenance');
  });
});