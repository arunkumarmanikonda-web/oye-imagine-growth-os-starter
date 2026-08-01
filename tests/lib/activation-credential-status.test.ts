import { describe, expect, it } from 'vitest';
import {
  buildCredentialStatusSummary,
  providerReady,
} from '../../src/lib/activation/credential-status';

describe('credential-status', () => {
  it('marks provider ready when all checks pass', () => {
    const summary = buildCredentialStatusSummary({
      provider: 'ga4',
      credentialsPresent: true,
      appReviewApproved: false,
      businessVerified: false,
      liveAccountConnected: true,
      webhookConfigured: true,
      callbackVerified: true,
    });

    expect(summary.status).toBe('ready');
    expect(providerReady(summary)).toBe(true);
  });

  it('marks meta partial when verification and app review are missing', () => {
    const summary = buildCredentialStatusSummary({
      provider: 'meta_marketing',
      credentialsPresent: true,
      appReviewApproved: false,
      businessVerified: false,
      liveAccountConnected: true,
      webhookConfigured: false,
      callbackVerified: false,
    });

    expect(summary.status).toBe('partial');
    expect(summary.blockers).toContain('app review not approved');
    expect(summary.blockers).toContain('business verification incomplete');
  });
});