import { describe, expect, it } from 'vitest';
import {
  buildStrategyPresentationManifest,
  strategyPresentationReadyForReview,
} from '../../src/lib/pilot/strategy-presentation';

describe('pilot strategy presentation', () => {
  it('builds a strategy presentation manifest with required sections', () => {
    const manifest = buildStrategyPresentationManifest({
      brandName: 'Neejee',
      websiteUrl: 'https://www.neejee.com',
      industry: 'premium jewellery',
      positioning: 'consultation-led premium jewellery brand',
      offerSummary: 'bridal and occasion-led jewellery consultation journeys',
      auditFindings: ['homepage needs stronger conversion path', 'category pages need trust signals'],
      competitorInsights: ['competitors emphasize collection depth', 'few offer consultation-led discovery'],
      growthGoals: ['increase qualified enquiries', 'improve conversion confidence'],
    });

    expect(manifest.sections).toHaveLength(6);
    expect(manifest.deckTitle).toBe('Neejee pilot strategy');
    expect(strategyPresentationReadyForReview(manifest)).toBe(true);
  });
});