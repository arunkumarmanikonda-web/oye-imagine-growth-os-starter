import { describe, expect, it } from 'vitest';
import { providerCatalog } from '../../src/lib/config-control/provider-catalog';

describe('config-control provider catalog', () => {
  it('contains razorpay-style payment gateway requirements', () => {
    expect(providerCatalog.payment_gateway.requiredKeys).toContain('PAYMENT_GATEWAY_KEY_ID');
    expect(providerCatalog.payment_gateway.requiredKeys).toContain('PAYMENT_GATEWAY_KEY_SECRET');
  });

  it('contains meta and google ads providers', () => {
    expect(providerCatalog.meta_marketing.label).toBe('Meta Marketing');
    expect(providerCatalog.google_ads.label).toBe('Google Ads');
  });
});