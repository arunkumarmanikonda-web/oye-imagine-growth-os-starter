import type { ProviderKey } from './config-types';
import { encryptSecret, maskSecretValue } from './crypto';

export type SecretWriteOperation = {
  provider: ProviderKey;
  secretKey: string;
  encryptedValue: string;
  maskedValue: string;
  updatedBy: string;
};

export function buildSecretWriteOperations(
  provider: ProviderKey,
  values: Record<string, string>,
  seed: string,
  updatedBy: string,
): SecretWriteOperation[] {
  return Object.entries(values)
    .filter(([, value]) => value.trim().length > 0)
    .map(([secretKey, value]) => ({
      provider,
      secretKey,
      encryptedValue: encryptSecret(seed, value),
      maskedValue: maskSecretValue(value),
      updatedBy,
    }));
}