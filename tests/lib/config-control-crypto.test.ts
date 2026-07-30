import { describe, expect, it } from 'vitest';
import {
  decryptSecret,
  encryptSecret,
  maskSecretValue,
} from '../../src/lib/config-control/crypto';

describe('config-control crypto', () => {
  it('encrypts and decrypts a secret', () => {
    const seed = 'local-test-seed';
    const plain = 'super-secret-value';
    const encrypted = encryptSecret(seed, plain);
    const decrypted = decryptSecret(seed, encrypted);

    expect(encrypted).not.toBe(plain);
    expect(decrypted).toBe(plain);
  });

  it('masks secret values safely', () => {
    expect(maskSecretValue('1234567890')).toBe('1234...7890');
  });
});