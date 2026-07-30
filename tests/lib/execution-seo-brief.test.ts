import { describe, expect, it } from 'vitest';
import { buildSeoBrief, seoBriefReadyForReview } from '../../src/lib/execution/seo-brief';

describe('execution seo brief', () => {
  it('builds an seo brief with titles, links, and schema recommendations', () => {
    const brief = buildSeoBrief({
      brandName: 'Neejee',
      offer: 'bridal jewellery consultations',
      audience: 'premium jewellery shoppers',
      primaryKeyword: 'bridal jewellery consultation',
      supportingKeywords: ['bridal jewellery', 'premium jewellery', 'bridal jewellery'],
      differentiators: ['founder-led curation', 'craft provenance'],
    });

    expect(brief.titleOptions.length).toBe(3);
    expect(brief.supportingKeywords).toEqual([
      'bridal jewellery',
      'premium jewellery',
    ]);
    expect(brief.schemaRecommendations).toContain('FAQPage');
  });

  it('marks a valid brief ready for review', () => {
    const brief = buildSeoBrief({
      brandName: 'Neejee',
      offer: 'bridal jewellery consultations',
      audience: 'premium jewellery shoppers',
      primaryKeyword: 'bridal jewellery consultation',
      supportingKeywords: ['bridal jewellery'],
      differentiators: ['founder-led curation'],
    });

    expect(seoBriefReadyForReview(brief)).toBe(true);
  });
});