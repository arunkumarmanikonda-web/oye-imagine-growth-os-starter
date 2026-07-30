import { describe, expect, it } from 'vitest';
import { buildCampaignDraft, campaignNeedsApproval } from '../../src/lib/execution/campaign-drafts';

describe('execution campaign drafts', () => {
  it('flags large budgets and platform-specific validation needs', () => {
    const draft = buildCampaignDraft({
      platform: 'meta_ads',
      objective: 'sales',
      budgetAmount: 60000,
      budgetCurrency: 'INR',
      geoTargets: ['IN-MH', 'IN-KA'],
      audienceSummary: 'premium jewellery shoppers',
      offer: 'bridal jewellery consultations',
      hooks: ['Craft-led bridal styling', 'Consult before you buy'],
    });

    expect(draft.complianceFlags).toContain('budget_review_required');
    expect(draft.complianceFlags).toContain('pixel_validation_required');
    expect(draft.adSets.length).toBe(2);
  });

  it('detects when approval is required', () => {
    const draft = buildCampaignDraft({
      platform: 'google_ads',
      objective: 'traffic',
      budgetAmount: 15000,
      budgetCurrency: 'INR',
      geoTargets: ['IN-DL'],
      audienceSummary: 'gift buyers',
      offer: 'festive jewellery gifting',
      hooks: ['Premium festive gifts'],
    });

    expect(campaignNeedsApproval(draft)).toBe(true);
  });
});