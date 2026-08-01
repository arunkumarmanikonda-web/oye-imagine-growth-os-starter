import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function deriveKey(seed: string): Buffer {
  return createHash('sha256').update(seed).digest();
}

export function encryptSecret(seed: string, plainText: string): string {
  const key = deriveKey(seed);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptSecret(seed: string, payload: string): string {
  const key = deriveKey(seed);
  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return plain.toString('utf8');
}

export function maskSecretValue(value: string): string {
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}