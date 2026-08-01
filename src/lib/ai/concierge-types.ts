export const AI_CONCIERGE_SURFACES = ['client', 'admin'] as const
export type AiConciergeSurface = (typeof AI_CONCIERGE_SURFACES)[number]

export const AI_CONCIERGE_INTENTS = [
  'billing_overview',
  'agreement_status',
  'payment_followup',
  'renewal_guidance',
  'support_handoff',
  'general_navigation',
] as const

export type AiConciergeIntent = (typeof AI_CONCIERGE_INTENTS)[number]

export const AI_CONCIERGE_TONES = ['positive', 'neutral', 'attention'] as const
export type AiConciergeTone = (typeof AI_CONCIERGE_TONES)[number]

export interface AiConciergeRequest {
  workspaceKey: string
  surface: AiConciergeSurface
  message: string
  referenceDate?: string
}

export interface AiConciergeContextSummary {
  workspaceKey: string
  clientName: string
  invoiceCount: number
  agreementCount: number
  totalInvoiced: number
  outstandingAmount: number
  openCollectionCount: number
  paidInvoiceCount: number
  automationJobCount: number
}

export interface AiConciergeInsight {
  id: string
  title: string
  detail: string
  tone: AiConciergeTone
}

export interface AiConciergeAction {
  id: string
  label: string
  href: string
  reason: string
}

export interface AiConciergeResponse {
  workspaceKey: string
  surface: AiConciergeSurface
  intent: AiConciergeIntent
  headline: string
  summary: string
  context: AiConciergeContextSummary
  insights: AiConciergeInsight[]
  actions: AiConciergeAction[]
  suggestedPrompts: string[]
}

export interface AiConciergePromptPreset {
  id: string
  title: string
  prompt: string
  intent: AiConciergeIntent
}

export interface AiConciergeWorkspaceCard {
  workspaceKey: string
  clientName: string
  invoiceCount: number
  agreementCount: number
  outstandingAmount: number
  openCollectionCount: number
}

export interface AiConciergeRegistrySummary {
  workspaces: number
  promptPresets: number
  intents: number
}