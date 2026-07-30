import { describe, expect, it } from 'vitest';
import {
  buildCommercialActivationSummary,
  commercialActivationReady,
} from '../../src/lib/pilot/commercial-activation-chain';

describe('commercial-activation-chain', () => {
  it('returns ready when all commercial checkpoints pass', () => {
    const summary = buildCommercialActivationSummary({
      brandName: 'Neejee',
      contractSigned: true,
      esignProviderReady: true,
      subscriptionActivated: true,
      invoiceProfileReady: true,
      paymentMethodReady: true,
      approvalPolicyReady: true,
    });

    expect(summary.status).toBe('ready');
    expect(commercialActivationReady(summary)).toBe(true);
  });

  it('returns blockers when checkpoints are incomplete', () => {
    const summary = buildCommercialActivationSummary({
      brandName: 'Neejee',
      contractSigned: false,
      esignProviderReady: false,
      subscriptionActivated: true,
      invoiceProfileReady: false,
      paymentMethodReady: false,
      approvalPolicyReady: true,
    });

    expect(summary.status).toBe('blocked');
    expect(summary.blockers).toContain('contract not signed');
    expect(summary.blockers).toContain('eSign provider not ready');
  });
});