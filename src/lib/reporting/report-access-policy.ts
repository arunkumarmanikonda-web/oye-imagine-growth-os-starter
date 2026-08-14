import type { ClientActivationState } from '@/lib/commercial/client-activation-journey';

export type ReportActorClass = 'platform_admin' | 'client' | 'partner' | 'system';

export function reportGenerationAllowed(input: {
  actorClass: ReportActorClass;
  activationState: ClientActivationState;
  subscriptionValid: boolean;
  entitled: boolean;
}) {
  if (input.actorClass === 'platform_admin') return true;
  if (input.actorClass === 'system') {
    return input.activationState === 'active' && input.subscriptionValid && input.entitled;
  }
  if (input.actorClass === 'client' || input.actorClass === 'partner') {
    return input.activationState === 'active' && input.subscriptionValid && input.entitled;
  }
  return false;
}

export function reportDeliveryAllowed(input: {
  activationState: ClientActivationState;
  subscriptionValid: boolean;
  entitled: boolean;
  verifiedDataOnly: boolean;
}) {
  return Boolean(
    input.activationState === 'active' &&
      input.subscriptionValid &&
      input.entitled &&
      input.verifiedDataOnly,
  );
}

export function reportAccessMessage(input: {
  actorClass: ReportActorClass;
  activationState: ClientActivationState;
  subscriptionValid: boolean;
  entitled: boolean;
}) {
  if (input.actorClass === 'platform_admin') {
    return 'Super Admin may generate operational reports across the platform subject to authorization and audit.';
  }
  if (input.activationState !== 'active') return 'Client reporting is available after commercial activation.';
  if (!input.subscriptionValid) return 'Reporting is paused because the subscription is not currently valid.';
  if (!input.entitled) return 'This reporting capability is not included in the active subscription.';
  return 'Reporting is available for automatic delivery and on-demand generation.';
}
