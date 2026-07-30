import type {
  ProviderKey,
  RuntimeProviderResolution,
} from './config-types';
import { providerCatalog } from './provider-catalog';

export function resolveRuntimeProviderConfig(
  provider: ProviderKey,
  envValues: Record<string, string | undefined>,
  storedSecretValues: Record<string, string | undefined>,
): RuntimeProviderResolution {
  const entry = providerCatalog[provider];
  const allKeys = [...entry.requiredKeys, ...entry.optionalKeys];
  const values: Record<string, string> = {};

  for (const key of allKeys) {
    const value = storedSecretValues[key] ?? envValues[key];
    if (value && value.length > 0) {
      values[key] = value;
    }
  }

  const missingRequired = entry.requiredKeys.filter((key) => !values[key]);

  return {
    provider,
    ready: missingRequired.length === 0,
    values,
    missingRequired,
  };
}