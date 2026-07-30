import { describe, expect, it } from 'vitest';
import { buildLandingPageDraft, landingPageReadyForApproval } from '../../src/lib/execution/landing-page';

describe('execution landing page draft', () => {
  it('builds a landing page draft with seo and hero copy', () => {
    const draft = buildLandingPageDraft({
      brandName: 'Neejee',
      offer: 'bridal jewellery consultations',
      audience: 'premium jewellery shoppers',
      primaryGoal: 'conversion',
      differentiators: ['founder-led curation', 'craft provenance'],
      proofPoints: ['premium collections', 'consultation-led purchase'],
      targetKeyword: 'bridal jewellery consultation',
    });

    expect(draft.targetUrlSlug).toBe('neejee-bridal-jewellery-consultations');
    expect(draft.sections.length).toBe(3);
    expect(draft.seo.keyword).toBe('bridal jewellery consultation');
  });

  it('marks a complete draft ready for approval', () => {
    const draft = buildLandingPageDraft({
      brandName: 'Neejee',
      offer: 'bridal jewellery consultations',
      audience: 'premium jewellery shoppers',
      primaryGoal: 'conversion',
      differentiators: ['founder-led curation'],
      proofPoints: ['consultation-led journey'],
      targetKeyword: 'bridal jewellery consultation',
    });

    expect(landingPageReadyForApproval(draft)).toBe(true);
  });
});