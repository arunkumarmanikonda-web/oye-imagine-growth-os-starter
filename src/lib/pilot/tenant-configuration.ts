import type {
  TenantConfigurationInput,
  TenantConfigurationSummary,
} from './pilot-integration-types';

export function buildTenantConfigurationSummary(
  input: TenantConfigurationInput,
): TenantConfigurationSummary {
  const missingFields: string[] = [];

  if (!input.tenantKey.trim()) missingFields.push('tenantKey');
  if (!input.brandName.trim()) missingFields.push('brandName');
  if (!input.workspaceSlug.trim()) missingFields.push('workspaceSlug');
  if (!input.region.trim()) missingFields.push('region');
  if (!input.defaultCurrency.trim()) missingFields.push('defaultCurrency');

  const enabledFeatures = Object.entries(input.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  const isReady =
    missingFields.length === 0 &&
    input.features.approvalsEnabled &&
    input.features.auditEnabled &&
    input.features.competitorTrackingEnabled;

  return {
    isReady,
    environment: isReady ? 'production_candidate' : 'pilot',
    missingFields,
    enabledFeatures,
  };
}

export function tenantConfigurationIsComplete(
  summary: TenantConfigurationSummary,
): boolean {
  return summary.isReady && summary.missingFields.length === 0;
}

export function tenantConfigurationNeedsConnectionSetup(
  summary: TenantConfigurationSummary,
): boolean {
  return !summary.isReady || summary.environment !== 'production_candidate'
}
