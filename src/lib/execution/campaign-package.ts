import type {
  CampaignPackageInput,
  CampaignPackageSummary,
} from './execution-integration-types';

export function buildCampaignPackageSummary(
  input: CampaignPackageInput,
): CampaignPackageSummary {
  const missingElements: string[] = [];

  if (!input.objective.trim()) missingElements.push('objective');
  if (input.assets.length === 0) missingElements.push('assets');
  if (input.copyVariants.length === 0) missingElements.push('copyVariants');
  if (!input.targetingSummary.audienceDefined) missingElements.push('audience');
  if (!input.targetingSummary.geoDefined) missingElements.push('geo');
  if (!input.targetingSummary.budgetDefined) missingElements.push('budget');

  return {
    packageStatus: missingElements.length === 0 ? 'ready' : 'incomplete',
    assetCount: input.assets.length,
    copyVariantCount: input.copyVariants.length,
    missingElements,
  };
}

export function campaignPackageReady(
  summary: CampaignPackageSummary,
): boolean {
  return summary.packageStatus === 'ready' && summary.missingElements.length === 0;
}