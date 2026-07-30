export const AI_MARKETPLACE_SURFACES = ['client', 'admin'] as const
export type AiMarketplaceSurface = (typeof AI_MARKETPLACE_SURFACES)[number]

export const AI_MARKETPLACE_INTENTS = [
  'billing_optimization',
  'growth_execution',
  'launch_acceleration',
  'seo_visibility',
  'reporting_visibility',
  'renewal_expansion',
  'general_discovery',
] as const
export type AiMarketplaceIntent = (typeof AI_MARKETPLACE_INTENTS)[number]

export const AI_MARKETPLACE_TONES = ['positive', 'neutral', 'attention'] as const
export type AiMarketplaceTone = (typeof AI_MARKETPLACE_TONES)[number]

export const AI_MARKETPLACE_CATEGORIES = [
  'commercial_ops',
  'growth_system',
  'launch_support',
  'seo_growth',
  'reporting_analytics',
  'retention_expansion',
] as const
export type AiMarketplaceCategory = (typeof AI_MARKETPLACE_CATEGORIES)[number]

export interface AiMarketplaceRequest {
  workspaceKey: string
  surface: AiMarketplaceSurface
  message: string
  referenceDate?: string
}

export interface AiMarketplaceOffer {
  id: string
  slug: string
  title: string
  category: AiMarketplaceCategory
  summary: string
  priceFrom: number
  surfaces: AiMarketplaceSurface[]
  intents: AiMarketplaceIntent[]
  tags: string[]
  bestFor: string[]
}

export interface AiMarketplaceContextSummary {
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

export interface AiMarketplaceInsight {
  id: string
  title: string
  detail: string
  tone: AiMarketplaceTone
}

export interface AiMarketplaceRecommendation {
  id: string
  offerId: string
  title: string
  category: AiMarketplaceCategory
  summary: string
  priceFrom: number
  score: number
  reason: string
}

export interface AiMarketplaceAction {
  id: string
  label: string
  href: string
  reason: string
}

export interface AiMarketplaceResponse {
  workspaceKey: string
  surface: AiMarketplaceSurface
  intent: AiMarketplaceIntent
  headline: string
  summary: string
  context: AiMarketplaceContextSummary
  insights: AiMarketplaceInsight[]
  recommendedOffers: AiMarketplaceRecommendation[]
  actions: AiMarketplaceAction[]
  suggestedPrompts: string[]
}

export interface AiMarketplacePromptPreset {
  id: string
  title: string
  prompt: string
  intent: AiMarketplaceIntent
}

export interface AiMarketplaceWorkspaceCard {
  workspaceKey: string
  clientName: string
  invoiceCount: number
  agreementCount: number
  outstandingAmount: number
  openCollectionCount: number
}

export interface AiMarketplaceRegistrySummary {
  workspaces: number
  offers: number
  promptPresets: number
  intents: number
}