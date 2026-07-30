import { describe, expect, it } from 'vitest';
import {
  buildProofExecutionAssetManifest,
  proofExecutionAssetsReady,
} from '../../src/lib/execution/proof-assets';

describe('execution proof assets', () => {
  it('builds the Neejee proof asset manifest', () => {
    const manifest = buildProofExecutionAssetManifest({
      brandName: 'Neejee',
      audience: 'premium jewellery shoppers',
      offer: 'bridal jewellery consultations',
      landingPageTitle: 'Neejee Bridal Consultation Landing Page',
      seoClusterTitle: 'Neejee Bridal SEO Cluster',
      socialTheme: 'bridal storytelling',
      campaignTheme: 'bridal conversion',
      creativeHookCount: 4,
    });

    expect(manifest.assets).toHaveLength(5);
    expect(manifest.assets[0]?.assetType).toBe('landing_page');
    expect(proofExecutionAssetsReady(manifest)).toBe(true);
  });
});