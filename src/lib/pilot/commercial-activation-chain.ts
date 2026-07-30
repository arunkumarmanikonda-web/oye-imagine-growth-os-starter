import type {
  CommercialActivationInput,
  CommercialActivationSummary,
} from './pilot-integration-types';

export function buildCommercialActivationSummary(
  input: CommercialActivationInput,
): CommercialActivationSummary {
  const blockers: string[] = [];

  if (!input.contractSigned) blockers.push('contract not signed');
  if (!input.esignProviderReady) blockers.push('eSign provider not ready');
  if (!input.subscriptionActivated) blockers.push('subscription not activated');
  if (!input.invoiceProfileReady) blockers.push('invoice profile incomplete');
  if (!input.paymentMethodReady) blockers.push('payment method missing');
  if (!input.approvalPolicyReady) blockers.push('approval policy incomplete');

  if (blockers.length === 0) {
    return {
      status: 'ready',
      blockers,
      nextAction: `${input.brandName}: move pilot into active commercial delivery`,
    };
  }

  return {
    status: 'blocked',
    blockers,
    nextAction: `${input.brandName}: clear commercial activation blockers`,
  };
}

export function commercialActivationReady(
  summary: CommercialActivationSummary,
): boolean {
  return summary.status === 'ready' && summary.blockers.length === 0;
}