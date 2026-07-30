import { describe, expect, it } from 'vitest';
import { resolveRuntimeProviderConfig } from '../../src/lib/config-control/runtime-resolver';

describe('config-control runtime resolver', () => {
  it('prefers stored secret values over env values', () => {
    const summary = resolveRuntimeProviderConfig(
      'payment_gateway',
      {
        PAYMENT_GATEWAY_PROVIDER: 'razorpay',
        PAYMENT_GATEWAY_KEY_ID: 'env-key-id',
        PAYMENT_GATEWAY_KEY_SECRET: 'env-key-secret',
        PAYMENT_GATEWAY_WEBHOOK_SECRET: 'env-webhook',
      },
      {
        PAYMENT_GATEWAY_KEY_SECRET: 'stored-key-secret',
      },
    );

    expect(summary.values.PAYMENT_GATEWAY_KEY_SECRET).toBe('stored-key-secret');
    expect(summary.ready).toBe(true);
  });

  it('reports missing required keys when incomplete', () => {
    const summary = resolveRuntimeProviderConfig(
      'google_ads',
      {
        GOOGLE_ADS_DEVELOPER_TOKEN: 'token',
      },
      {},
    );

    expect(summary.ready).toBe(false);
    expect(summary.missingRequired).toContain('GOOGLE_ADS_CLIENT_ID');
  });
});