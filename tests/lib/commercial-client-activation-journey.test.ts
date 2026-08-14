import { describe, expect, it } from 'vitest';
import {
  activationBlockingReason,
  assertClientActivationTransition,
  canTransitionClientActivation,
  clientMayReceiveLockedPlan,
  clientModulesAreEnabled,
  commercialRequirementsForState,
  type ClientActivationJourney,
} from '../../src/lib/commercial/client-activation-journey';

describe('client commercial activation journey', () => {
  it('requires the ordered KYC to signed agreement to payment to invoice journey', () => {
    expect(canTransitionClientActivation('kyc_verified', 'agreement_generated')).toBe(true);
    expect(canTransitionClientActivation('agreement_generated', 'esign_sent')).toBe(true);
    expect(canTransitionClientActivation('esign_sent', 'agreement_signed')).toBe(true);
    expect(canTransitionClientActivation('agreement_signed', 'payment_pending')).toBe(true);
    expect(canTransitionClientActivation('payment_processing', 'payment_successful')).toBe(true);
    expect(canTransitionClientActivation('payment_successful', 'invoice_issued')).toBe(true);
    expect(canTransitionClientActivation('invoice_issued', 'active')).toBe(true);
  });

  it('does not allow payment to skip KYC and contract execution', () => {
    expect(canTransitionClientActivation('signup_completed', 'payment_successful')).toBe(false);
    expect(() => assertClientActivationTransition('kyc_pending', 'active')).toThrow(
      'client_activation_transition_denied',
    );
  });

  it('keeps the generated plan locked and modules disabled until active', () => {
    expect(clientMayReceiveLockedPlan('brand_plan_ready_locked')).toBe(false);
    expect(clientMayReceiveLockedPlan('payment_successful')).toBe(false);
    expect(clientModulesAreEnabled('invoice_issued')).toBe(false);
    expect(clientModulesAreEnabled('active')).toBe(true);
  });

  it('exposes commercial evidence requirements for activation', () => {
    expect(commercialRequirementsForState('active')).toEqual({
      kycVerified: true,
      agreementSigned: true,
      paymentSuccessful: true,
      invoiceIssued: true,
      modulesEnabled: true,
    });
  });

  it('returns the next meaningful activation block', () => {
    const journey: ClientActivationJourney = {
      journeyId: 'journey-1',
      tenantId: 'tenant-1',
      workspaceId: 'workspace-1',
      state: 'agreement_signed',
      selectedModules: ['channels.google_ads'],
      billingCadence: 'monthly',
      brandPlanArtifactId: 'plan-1',
      kycCaseId: 'kyc-1',
      agreementId: 'agreement-1',
      esignEnvelopeId: 'envelope-1',
      paymentLinkId: null,
      recurringMandateId: null,
      paymentId: null,
      invoiceId: null,
      activatedAt: null,
    };
    expect(activationBlockingReason(journey)).toBe('Subscription payment has not been confirmed.');
  });
});
