import { describe, expect, it } from 'vitest';
import {
  computeBrandReadiness,
  listMissingBrandProfileFields,
  mergeBrandSignals,
} from '../../src/lib/pilot/brand-profile';
import type { BrandProfile } from '../../src/lib/pilot/onboarding-types';

describe('pilot brand profile', () => {
  const baseProfile: BrandProfile = {
    profileId: 'profile_1',
    tenantId: 'tenant_1',
    brandId: 'brand_1',
    brandPurpose: '',
    brandStory: '',
    valueProposition: '',
    toneOfVoice: '',
    approvedTerms: [],
    prohibitedTerms: [],
    audiencePersonas: [],
    productCategories: [],
    geographyNotes: [],
    complianceNotes: [],
    visualGuidelines: {},
    profileStatus: 'draft',
    readinessScore: 0,
    sourcePayload: {},
  };

  it('lists missing fields', () => {
    const missing = listMissingBrandProfileFields(baseProfile);
    expect(missing).toContain('brandPurpose');
    expect(missing).toContain('approvedTerms');
  });

  it('computes readiness', () => {
    expect(computeBrandReadiness(baseProfile)).toBe(0);

    const merged = mergeBrandSignals(baseProfile, {
      brandPurpose: 'Celebrate personal craft stories.',
      brandStory: 'Founder-led Indian craft brand.',
      valueProposition: 'Quiet luxury with provenance.',
      toneOfVoice: 'Warm, premium, grounded.',
      approvedTerms: ['craft', 'personal', 'found'],
      audiencePersonas: ['gift buyers', 'design-aware premium shoppers'],
      productCategories: ['jewellery', 'craft gifts'],
    });

    expect(merged.readinessScore).toBe(100);
  });
});