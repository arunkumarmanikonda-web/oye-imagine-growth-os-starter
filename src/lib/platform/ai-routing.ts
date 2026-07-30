import type {
  AiProviderDefinition,
  AiRouteRequest,
  AiRouteSelection,
  AiTaskRoute,
} from './control-plane-types';

export function selectAiProvider(
  providers: AiProviderDefinition[],
  routes: AiTaskRoute[],
  request: AiRouteRequest,
): AiRouteSelection {
  const route =
    routes.find((item) => item.taskKey === request.taskKey && item.enabled) ?? null;

  if (!route) {
    return {
      providerKey: null,
      routeId: null,
      usedFallback: false,
      reason: 'route_not_found',
    };
  }

  const providerMap = new Map(
    providers.map((provider) => [provider.providerKey, provider]),
  );

  const primary = providerMap.get(route.primaryProviderKey) ?? null;
  const fallback = route.fallbackProviderKey
    ? (providerMap.get(route.fallbackProviderKey) ?? null)
    : null;

  const costLimitExceeded =
    typeof request.estimatedCostUsd === 'number' &&
    typeof route.maxCostUsd === 'number' &&
    request.estimatedCostUsd > route.maxCostUsd;

  if (primary?.enabled && !costLimitExceeded) {
    return {
      providerKey: primary.providerKey,
      routeId: route.routeId,
      usedFallback: false,
      reason: 'selected',
    };
  }

  if (request.allowFallback === false) {
    return {
      providerKey: null,
      routeId: route.routeId,
      usedFallback: false,
      reason: costLimitExceeded ? 'cost_limit_exceeded' : 'primary_disabled',
    };
  }

  if (fallback?.enabled) {
    return {
      providerKey: fallback.providerKey,
      routeId: route.routeId,
      usedFallback: true,
      reason: 'selected',
    };
  }

  return {
    providerKey: null,
    routeId: route.routeId,
    usedFallback: false,
    reason: costLimitExceeded ? 'cost_limit_exceeded' : 'fallback_unavailable',
  };
}