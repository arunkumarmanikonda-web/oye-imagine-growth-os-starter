import type {
  ProofExecutionAssetInput,
  ProofExecutionAssetManifest,
} from './execution-governance-types';

export function buildProofExecutionAssetManifest(
  input: ProofExecutionAssetInput,
): ProofExecutionAssetManifest {
  return {
    assets: [
      {
        assetType: 'landing_page',
        title: input.landingPageTitle,
        summary: `${input.brandName} landing page for ${input.offer} targeting ${input.audience}`,
      },
      {
        assetType: 'seo_cluster',
        title: input.seoClusterTitle,
        summary: `${input.brandName} SEO/AEO cluster around ${input.offer}`,
      },
      {
        assetType: 'social_calendar',
        title: `${input.brandName} ${input.socialTheme} social calendar`,
        summary: `Governed social calendar for ${input.socialTheme}`,
      },
      {
        assetType: 'creative_set',
        title: `${input.brandName} creative set`,
        summary: `${input.creativeHookCount} approved creative hook(s) for ${input.offer}`,
      },
      {
        assetType: 'campaign_draft',
        title: `${input.brandName} ${input.campaignTheme} campaign draft`,
        summary: `Draft campaign package for ${input.campaignTheme}`,
      },
    ],
  };
}

export function proofExecutionAssetsReady(
  manifest: ProofExecutionAssetManifest,
): boolean {
  return manifest.assets.length === 5 &&
    manifest.assets.every((asset) => Boolean(asset.title && asset.summary));
}

export function proofExecutionAssetsSupportBatchDClosure(
  manifest: ProofExecutionAssetManifest,
): boolean {
  const assetTypes = manifest.assets.map((asset) => asset.assetType);
  return Boolean(
    proofExecutionAssetsReady(manifest) &&
    assetTypes.includes('seo_cluster') &&
    assetTypes.includes('social_calendar') &&
    assetTypes.includes('creative_set') &&
    assetTypes.includes('campaign_draft')
  );
}
