import type {
  CredentialStatusInput,
  CredentialStatusSummary,
} from './activation-types';
import { providerRequirements } from './provider-requirements';

export function buildCredentialStatusSummary(
  input: CredentialStatusInput,
): CredentialStatusSummary {
  const requirement = providerRequirements[input.provider];
  const blockers: string[] = [];
  const readyChecks: string[] = [];

  if (input.credentialsPresent) {
    readyChecks.push('credentials present');
  } else {
    blockers.push('credentials missing');
  }

  if (requirement.requiresAppReview) {
    if (input.appReviewApproved) readyChecks.push('app review approved');
    else blockers.push('app review not approved');
  }

  if (requirement.requiresBusinessVerification) {
    if (input.businessVerified) readyChecks.push('business verification complete');
    else blockers.push('business verification incomplete');
  }

  if (requirement.requiresLiveAccount) {
    if (input.liveAccountConnected) readyChecks.push('live account connected');
    else blockers.push('live account not connected');
  }

  if (input.webhookConfigured) readyChecks.push('webhook configured');
  else blockers.push('webhook not configured');

  if (input.callbackVerified) readyChecks.push('callback verified');
  else blockers.push('callback not verified');

  let status: 'ready' | 'partial' | 'blocked' = 'blocked';
  if (blockers.length === 0) {
    status = 'ready';
  } else if (readyChecks.length > 0) {
    status = 'partial';
  }

  return {
    provider: input.provider,
    status,
    blockers,
    readyChecks,
  };
}

export function providerReady(summary: CredentialStatusSummary): boolean {
  return summary.status === 'ready' && summary.blockers.length === 0;
}