import { describe, expect, it } from 'vitest';
import { selectAiProvider } from '../../src/lib/platform/ai-routing';
import type {
  AiProviderDefinition,
  AiTaskRoute,
} from '../../src/lib/platform/control-plane-types';

describe('platform ai routing', () => {
  const providers: AiProviderDefinition[] = [
    {
      providerKey: 'google',
      providerType: 'llm',
      displayName: 'Google',
      enabled: true,
    },
    {
      providerKey: 'openai',
      providerType: 'llm',
      displayName: 'OpenAI',
      enabled: true,
    },
    {
      providerKey: 'anthropic',
      providerType: 'llm',
      displayName: 'Anthropic',
      enabled: false,
    },
  ];

  const routes: AiTaskRoute[] = [
    {
      routeId: 'route_1',
      taskKey: 'brand.strategy.generate',
      primaryProviderKey: 'google',
      fallbackProviderKey: 'openai',
      maxCostUsd: 2.5,
      enabled: true,
    },
  ];

  it('selects the primary provider when enabled and in budget', () => {
    const selection = selectAiProvider(providers, routes, {
      taskKey: 'brand.strategy.generate',
      estimatedCostUsd: 1.25,
    });

    expect(selection.providerKey).toBe('google');
    expect(selection.usedFallback).toBe(false);
    expect(selection.reason).toBe('selected');
  });

  it('uses fallback when the primary provider is disabled', () => {
    const overriddenProviders = providers.map((provider) =>
      provider.providerKey === 'google'
        ? { ...provider, enabled: false }
        : provider,
    );

    const selection = selectAiProvider(overriddenProviders, routes, {
      taskKey: 'brand.strategy.generate',
      estimatedCostUsd: 1.25,
    });

    expect(selection.providerKey).toBe('openai');
    expect(selection.usedFallback).toBe(true);
    expect(selection.reason).toBe('selected');
  });

  it('returns cost limit exceeded when over budget and fallback is not allowed', () => {
    const selection = selectAiProvider(providers, routes, {
      taskKey: 'brand.strategy.generate',
      estimatedCostUsd: 5,
      allowFallback: false,
    });

    expect(selection.providerKey).toBeNull();
    expect(selection.reason).toBe('cost_limit_exceeded');
  });
});