import { describe, expect, it } from 'vitest';
import { buildCreativeAssetDraft, creativeDraftNeedsLegalReview } from '../../src/lib/execution/creative-workflows';

describe('execution creative workflows', () => {
  it('builds creative assets and flags risky claims', () => {
    const draft = buildCreativeAssetDraft({
      platform: 'organic_social',
      objective: 'engagement',
      offer: 'bridal jewellery consultations',
      audience: 'premium jewellery shoppers',
      hooks: ['Find your bridal style', '100% confidence before purchase'],
      formats: ['carousel', 'reel'],
      claims: ['100% confidence'],
    });

    expect(draft.assets.length).toBe(2);
    expect(draft.complianceFlags).toContain('claim_disclaimer_required');
    expect(draft.complianceFlags).toContain('claim_substantiation_required');
  });

  it('detects when legal review is not needed', () => {
    const draft = buildCreativeAssetDraft({
      platform: 'google_ads',
      objective: 'traffic',
      offer: 'festive gifting',
      audience: 'gift buyers',
      hooks: ['Premium gifting collections'],
      formats: ['banner'],
      claims: [],
      disclaimer: 'Terms apply.',
    });

    expect(creativeDraftNeedsLegalReview(draft)).toBe(false);
  });
});