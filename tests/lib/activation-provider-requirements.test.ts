import { describe, expect, it } from 'vitest';
import { providerRequirements } from '../../src/lib/activation/provider-requirements';

describe('provider-requirements', () => {
  it('marks meta as requiring app review and business verification', () => {
    expect(providerRequirements.meta_marketing.requiresAppReview).toBe(true);
    expect(providerRequirements.meta_marketing.requiresBusinessVerification).toBe(true);
  });

  it('marks google ads as requiring live account but not app review', () => {
    expect(providerRequirements.google_ads.requiresLiveAccount).toBe(true);
    expect(providerRequirements.google_ads.requiresAppReview).toBe(false);
  });
});