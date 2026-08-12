export type PublicUiState = 'empty' | 'loading' | 'error' | 'success'

export type PublicStateCopy = {
  eyebrow: string
  title: string
  body: string
  actionLabel?: string
  retryLabel?: string
}

export const PUBLIC_STATE_COPY: Record<PublicUiState, PublicStateCopy> = {
  empty: {
    eyebrow: 'Empty state',
    title: 'Nothing to show yet',
    body: 'We do not have anything to display yet. Start the flow, change the filters, or retry the request.',
    actionLabel: 'Start now',
  },
  loading: {
    eyebrow: 'Loading state',
    title: 'Working on your request',
    body: 'We are validating details, loading the next step, and preparing the safest path forward.',
    actionLabel: 'Loading',
  },
  error: {
    eyebrow: 'Error state',
    title: 'Something needs attention',
    body: 'The request did not complete. Review the details and retry without losing your place.',
    retryLabel: 'Try again',
  },
  success: {
    eyebrow: 'Success state',
    title: 'Request completed',
    body: 'Everything was submitted successfully. You can continue with the next step or return to the public route.',
    actionLabel: 'Continue',
  },
}

export const PUBLIC_FORM_STATE_LIBRARY = {
  support: 'support@oyeimagine.com',
  legalIdentity: 'OYE Imagine Private Limited',
  jurisdiction: 'Jurisdiction: India',
  privacy: 'PII is masked in logs and all public forms remain Turnstile-ready.',
  states: ['empty', 'loading', 'error', 'success'] as PublicUiState[],
  intents: ['contact', 'demo', 'audit', 'onboarding', 'qualify', 'scope', 'dsar'] as const,
}

export function getPublicStateCopy(
  state: PublicUiState,
  overrides: Partial<PublicStateCopy> = {},
): PublicStateCopy {
  return {
    ...PUBLIC_STATE_COPY[state],
    ...overrides,
  }
}

export function buildPublicFormMessage(parts: Array<string | undefined | null>) {
  return parts
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join(' | ')
}