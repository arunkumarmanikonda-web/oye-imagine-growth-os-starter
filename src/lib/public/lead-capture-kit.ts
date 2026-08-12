import { z } from 'zod'

export const LEAD_CAPTURE_INTENTS = [
  'contact',
  'demo',
  'audit',
  'onboarding',
  'qualify',
  'scope',
  'dsar',
] as const

export type LeadCaptureIntent = (typeof LEAD_CAPTURE_INTENTS)[number]

export type LeadCaptureSubmission = {
  intent: LeadCaptureIntent
  name: string
  email: string
  company: string
  message: string
  useCase?: string
  source?: string
  turnstileToken?: string
}

export const leadCaptureSubmissionSchema = z.object({
  intent: z.enum(LEAD_CAPTURE_INTENTS),
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Valid email is required.'),
  company: z.string().trim().min(2, 'Company is required.'),
  message: z.string().trim().min(10, 'Message is required.'),
  useCase: z.string().trim().optional().default(''),
  source: z.string().trim().optional().default('public-web'),
  turnstileToken: z.string().trim().optional().default(''),
})

export const LEAD_CAPTURE_FORM_FIELDS = [
  {
    key: 'name',
    label: 'Full name',
    placeholder: 'Alex Morgan',
    kind: 'text',
    required: true,
  },
  {
    key: 'email',
    label: 'Work email',
    placeholder: 'alex@company.com',
    kind: 'email',
    required: true,
  },
  {
    key: 'company',
    label: 'Company',
    placeholder: 'Acme Growth',
    kind: 'text',
    required: true,
  },
  {
    key: 'message',
    label: 'Message',
    placeholder: 'Tell us the workflow, request, or pain point you need solved.',
    kind: 'textarea',
    required: true,
  },
] as const

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeLeadCaptureSubmission(
  input: Partial<LeadCaptureSubmission> | null | undefined,
): LeadCaptureSubmission {
  const rawIntent = trimString(input?.intent) as LeadCaptureIntent

  return {
    intent: LEAD_CAPTURE_INTENTS.includes(rawIntent) ? rawIntent : 'contact',
    name: trimString(input?.name),
    email: trimString(input?.email).toLowerCase(),
    company: trimString(input?.company),
    message: trimString(input?.message),
    useCase: trimString(input?.useCase),
    source: trimString(input?.source) || 'public-web',
    turnstileToken: trimString(input?.turnstileToken),
  }
}

function maskText(value: string) {
  if (!value) return ''
  if (value.length <= 2) return '*'.repeat(value.length)
  return `${value.slice(0, 1)}***${value.slice(-1)}`
}

function maskEmail(email: string) {
  if (!email || !email.includes('@')) return ''
  const [local, domain] = email.split('@')
  const safeLocal =
    local.length <= 2 ? `${local[0] || ''}*` : `${local.slice(0, 1)}***${local.slice(-1)}`
  return `${safeLocal}@${domain}`
}

export function maskLeadCaptureSubmission(payload: LeadCaptureSubmission) {
  return {
    intent: payload.intent,
    name: maskText(payload.name),
    email: maskEmail(payload.email),
    company: maskText(payload.company),
    message: payload.message ? '[redacted-message]' : '',
    useCase: payload.useCase ? '[redacted-use-case]' : '',
    source: payload.source,
    hasTurnstileToken: Boolean(payload.turnstileToken),
  }
}

export function buildLeadCaptureAuditEvent(payload: LeadCaptureSubmission, requestId: string) {
  return {
    event: 'public_lead_capture_submitted',
    requestId,
    submittedAt: new Date().toISOString(),
    intent: payload.intent,
    source: payload.source,
    company: payload.company,
  }
}

export function buildLeadCaptureEmailProof(payload: LeadCaptureSubmission, requestId: string) {
  return {
    requestId,
    template: `public-${payload.intent}-confirmation`,
    recipient: maskEmail(payload.email),
    status: 'queued-for-proof',
    intent: payload.intent,
    createdAt: new Date().toISOString(),
  }
}

export function getLeadCaptureExperience() {
  return {
    title: 'Shared public lead capture kit',
    description:
      'Standardized validation, persistence, audit proof, confirmation proof, and governed UX for all public intake forms.',
    intents: LEAD_CAPTURE_INTENTS.map((intent) => ({
      intent,
      routeHint:
        intent === 'contact'
          ? '/contact'
          : intent === 'demo'
            ? '/request-demo'
            : `/${intent}`,
    })),
    support: 'support@oyeimagine.com',
    legalIdentity: 'OYE Imagine Private Limited',
    privacy: 'PII is masked in logs and all forms remain Turnstile-ready.',
    states: ['idle', 'loading', 'success', 'error'],
  }
}