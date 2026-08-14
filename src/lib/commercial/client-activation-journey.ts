export const CLIENT_ACTIVATION_STATES = [
  'signup_completed',
  'brand_learning',
  'brand_plan_ready_locked',
  'kyc_pending',
  'kyc_verified',
  'agreement_generated',
  'esign_sent',
  'agreement_signed',
  'payment_pending',
  'payment_processing',
  'payment_successful',
  'invoice_issued',
  'active',
  'suspended',
  'cancelled',
] as const;

export type ClientActivationState = (typeof CLIENT_ACTIVATION_STATES)[number];
export type BillingCadence = 'monthly' | 'annual';

export type ClientActivationJourney = {
  journeyId: string;
  tenantId: string;
  workspaceId: string;
  state: ClientActivationState;
  selectedModules: string[];
  billingCadence: BillingCadence | null;
  brandPlanArtifactId: string | null;
  kycCaseId: string | null;
  agreementId: string | null;
  esignEnvelopeId: string | null;
  paymentLinkId: string | null;
  recurringMandateId: string | null;
  paymentId: string | null;
  invoiceId: string | null;
  activatedAt: string | null;
};

const FORWARD_TRANSITIONS: Record<ClientActivationState, ClientActivationState[]> = {
  signup_completed: ['brand_learning', 'cancelled'],
  brand_learning: ['brand_plan_ready_locked', 'cancelled'],
  brand_plan_ready_locked: ['kyc_pending', 'cancelled'],
  kyc_pending: ['kyc_verified', 'cancelled'],
  kyc_verified: ['agreement_generated', 'cancelled'],
  agreement_generated: ['esign_sent', 'cancelled'],
  esign_sent: ['agreement_signed', 'cancelled'],
  agreement_signed: ['payment_pending', 'cancelled'],
  payment_pending: ['payment_processing', 'cancelled'],
  payment_processing: ['payment_successful', 'payment_pending', 'cancelled'],
  payment_successful: ['invoice_issued'],
  invoice_issued: ['active'],
  active: ['suspended', 'cancelled'],
  suspended: ['active', 'cancelled'],
  cancelled: [],
};

export function canTransitionClientActivation(
  from: ClientActivationState,
  to: ClientActivationState,
) {
  return FORWARD_TRANSITIONS[from].includes(to);
}

export function assertClientActivationTransition(
  from: ClientActivationState,
  to: ClientActivationState,
) {
  if (!canTransitionClientActivation(from, to)) {
    throw new Error(`client_activation_transition_denied:${from}:${to}`);
  }
}

export function clientMayReceiveLockedPlan(state: ClientActivationState) {
  return state === 'active';
}

export function clientModulesAreEnabled(state: ClientActivationState) {
  return state === 'active';
}

export function commercialRequirementsForState(state: ClientActivationState) {
  return {
    kycVerified: [
      'kyc_verified',
      'agreement_generated',
      'esign_sent',
      'agreement_signed',
      'payment_pending',
      'payment_processing',
      'payment_successful',
      'invoice_issued',
      'active',
      'suspended',
    ].includes(state),
    agreementSigned: [
      'agreement_signed',
      'payment_pending',
      'payment_processing',
      'payment_successful',
      'invoice_issued',
      'active',
      'suspended',
    ].includes(state),
    paymentSuccessful: ['payment_successful', 'invoice_issued', 'active', 'suspended'].includes(state),
    invoiceIssued: ['invoice_issued', 'active', 'suspended'].includes(state),
    modulesEnabled: clientModulesAreEnabled(state),
  };
}

export function activationBlockingReason(journey: ClientActivationJourney) {
  if (journey.state === 'active') return null;
  if (journey.state === 'cancelled') return 'Client onboarding has been cancelled.';
  if (journey.state === 'suspended') return 'Subscription or compliance status requires resolution.';
  if (!commercialRequirementsForState(journey.state).kycVerified) return 'KYC verification is incomplete.';
  if (!commercialRequirementsForState(journey.state).agreementSigned) return 'The generated agreement has not been digitally signed.';
  if (!commercialRequirementsForState(journey.state).paymentSuccessful) return 'Subscription payment has not been confirmed.';
  if (!commercialRequirementsForState(journey.state).invoiceIssued) return 'Tax invoice issuance is incomplete.';
  return 'Activation is awaiting completion of the commercial control plane.';
}
