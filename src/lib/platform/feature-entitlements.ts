import type {
  EntitlementState,
  FeatureFlagDefinition,
  FeatureResolutionQuery,
  TenantFeatureEntitlement,
} from './control-plane-types';

function specificity(item: TenantFeatureEntitlement): number {
  let score = 0;
  if (item.brandId) score += 2;
  if (item.workspaceId) score += 4;
  return score;
}

export function resolveFeatureState(
  definitions: FeatureFlagDefinition[],
  entitlements: TenantFeatureEntitlement[],
  query: FeatureResolutionQuery,
): EntitlementState {
  const definition = definitions.find((x) => x.flagKey === query.flagKey);
  if (!definition) return 'disabled';

  const match = entitlements
    .filter((x) => x.isActive)
    .filter((x) => x.tenantId === query.tenantId)
    .filter((x) => x.flagKey === query.flagKey)
    .filter((x) => x.brandId == null || x.brandId === query.brandId)
    .filter((x) => x.workspaceId == null || x.workspaceId === query.workspaceId)
    .sort((a, b) => {
      const s = specificity(b) - specificity(a);
      if (s !== 0) return s;
      return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
    })[0];

  return match?.state ?? definition.defaultState;
}

export function isFeatureEnabled(
  definitions: FeatureFlagDefinition[],
  entitlements: TenantFeatureEntitlement[],
  query: FeatureResolutionQuery,
): boolean {
  const state = resolveFeatureState(definitions, entitlements, query);
  if (state === 'enabled') return true;
  if (state === 'trial') return query.allowTrial ?? true;
  return false;
}