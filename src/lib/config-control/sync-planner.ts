import type {
  GlobalSyncSummary,
  ProviderKey,
  ProviderSyncPlan,
} from './config-types';
import { providerCatalog } from './provider-catalog';

export function buildProviderSyncPlan(
  provider: ProviderKey,
  configuredKeys: string[],
): ProviderSyncPlan {
  const entry = providerCatalog[provider];
  const missingRequired = entry.requiredKeys.filter(
    (key) => !configuredKeys.includes(key),
  );

  let status: 'ready' | 'partial' | 'missing' = 'missing';
  if (missingRequired.length === 0) {
    status = 'ready';
  } else if (configuredKeys.length > 0) {
    status = 'partial';
  }

  return {
    provider,
    status,
    configuredKeys,
    missingRequired,
    targets: entry.syncTargets,
  };
}

export function buildGlobalSyncSummary(
  plans: ProviderSyncPlan[],
): GlobalSyncSummary {
  const readyCount = plans.filter((plan) => plan.status === 'ready').length;
  const partialCount = plans.filter((plan) => plan.status === 'partial').length;
  const missingCount = plans.filter((plan) => plan.status === 'missing').length;
  const blockedProviders = plans
    .filter((plan) => plan.status !== 'ready')
    .map((plan) => plan.provider);

  return {
    readyCount,
    partialCount,
    missingCount,
    blockedProviders,
  };
}