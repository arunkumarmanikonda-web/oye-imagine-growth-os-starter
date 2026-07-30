import { describe, expect, it } from 'vitest';
import {
  buildSearchOptimizationBrief,
  searchOptimizationReady,
} from '../../src/lib/execution/search-optimization';

describe('execution search optimization', () => {
  it('builds a search optimization brief for ai-search surfaces', () => {
    const brief = buildSearchOptimizationBrief({
      brandName: 'Neejee',
      targetSurface: 'ai_search',
      primaryTopic: 'bridal jewellery consultation',
      audience: 'premium jewellery shoppers',
      offer: 'bridal jewellery consultations',
      differentiators: ['founder-led curation', 'consultation-first journey'],
      supportingKeywords: ['bridal jewellery', 'premium jewellery consultation'],
    });

    expect(brief.targetSurface).toBe('ai_search');
    expect(brief.supportingQueries.length).toBeGreaterThanOrEqual(3);
    expect(brief.answerEntities).toContain('Neejee');
    expect(searchOptimizationReady(brief)).toBe(true);
  });
});