export const CONTENT_PAGE_KINDS = [
  'public_page',
  'marketplace_page',
  'auth_page',
  'client_page',
  'operator_page',
  'system_page',
] as const

export const CONTENT_SECTION_KINDS = [
  'hero',
  'cta',
  'proof',
  'promo',
  'faq',
  'contact',
  'people',
  'legal',
  'support',
  'feature_grid',
  'metrics',
  'rich_text',
  'logo_cloud',
] as const

export const PROMOTION_KINDS = ['banner', 'offer', 'announcement', 'campaign_strip'] as const
export const PEOPLE_PROFILE_ROLES = ['leadership', 'expert', 'advisor', 'support', 'specialist'] as const
export const CONTENT_VISIBILITIES = ['public', 'client', 'operator', 'shared'] as const
export const CONTENT_LIFECYCLE_STATUSES = ['draft', 'published', 'scheduled', 'archived'] as const
export const PROVIDER_KINDS = ['supabase', 'resend', 'legal_identity', 'support_contact', 'cms', 'security'] as const
export const PROVIDER_STATUSES = ['connected', 'seeded', 'attention_required', 'not_configured'] as const
export const SUPPORT_CHANNEL_TYPES = ['email', 'phone', 'whatsapp', 'contact_form'] as const
export const SUPPORT_MESSAGE_DIRECTIONS = ['inbound', 'outbound'] as const
export const AI_CONTENT_OPERATION_KINDS = [
  'generate_draft',
  'rewrite',
  'expand',
  'shorten',
  'create_variants',
  'generate_seo',
  'generate_banner',
  'generate_faq',
  'generate_bio',
  'suggest_improvements',
  'schedule_publish',
  'rollback_version',
] as const

export type ContentPageKind = (typeof CONTENT_PAGE_KINDS)[number]
export type ContentSectionKind = (typeof CONTENT_SECTION_KINDS)[number]
export type PromotionKind = (typeof PROMOTION_KINDS)[number]
export type PeopleProfileRole = (typeof PEOPLE_PROFILE_ROLES)[number]
export type ContentVisibility = (typeof CONTENT_VISIBILITIES)[number]
export type ContentLifecycleStatus = (typeof CONTENT_LIFECYCLE_STATUSES)[number]
export type ProviderKind = (typeof PROVIDER_KINDS)[number]
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number]
export type SupportChannelType = (typeof SUPPORT_CHANNEL_TYPES)[number]
export type SupportMessageDirection = (typeof SUPPORT_MESSAGE_DIRECTIONS)[number]
export type AiContentOperationKind = (typeof AI_CONTENT_OPERATION_KINDS)[number]

export interface OrganizationLegalIdentity {
  legalName: string
  brandName: string
  companyType: string
  incorporationDate: string
  cin: string
  pan: string
  tan: string
  gstin: string
  gstRegistrationType: string
  gstEffectiveDate: string
  principalPlaceOfBusiness: string
  domain: string
}

export interface OrganizationContactProfile {
  primaryEmail: string
  supportEmail: string
  primaryPhone: string
  supportPhone: string
  supportHours: string
  resendFromEmail: string
}

export interface OrganizationProfile {
  id: string
  legalIdentity: OrganizationLegalIdentity
  contactProfile: OrganizationContactProfile
  footerIdentityLine: string
  trustCopy: string
  issuerLabel: string
  agreementPartyLabel: string
  invoiceIssuerLabel: string
}

export interface SupportChannel {
  id: string
  type: SupportChannelType
  label: string
  value: string
  provider: string
  purpose: string
  isPrimary: boolean
}

export interface SupportMailboxRecord {
  id: string
  direction: SupportMessageDirection
  subject: string
  channelId: string
  from: string
  to: string
  status: 'received' | 'queued' | 'sent' | 'replied'
  summary: string
  createdAt: string
}

export interface ContentPage {
  id: string
  slug: string
  title: string
  kind: ContentPageKind
  visibility: ContentVisibility
  lifecycleStatus: ContentLifecycleStatus
  seoTitle: string
  seoDescription: string
}

export interface ContentSection {
  id: string
  pageId: string
  key: string
  title: string
  kind: ContentSectionKind
  order: number
  lifecycleStatus: ContentLifecycleStatus
  summary: string
}

export interface ContentPromotion {
  id: string
  key: string
  kind: PromotionKind
  title: string
  summary: string
  ctaLabel: string
  ctaHref: string
  lifecycleStatus: ContentLifecycleStatus
}

export interface PeopleProfile {
  id: string
  role: PeopleProfileRole
  displayName: string
  title: string
  summary: string
  lifecycleStatus: ContentLifecycleStatus
  featured: boolean
}

export interface FaqEntry {
  id: string
  audience: ContentVisibility
  question: string
  answer: string
  lifecycleStatus: ContentLifecycleStatus
}

export interface ContentPublishVersion {
  id: string
  targetType: 'page' | 'section' | 'promotion' | 'person' | 'faq'
  targetId: string
  versionLabel: string
  lifecycleStatus: ContentLifecycleStatus
  scheduledFor?: string
  publishedAt?: string
}

export interface ContentAuditEvent {
  id: string
  targetType: 'page' | 'section' | 'promotion' | 'person' | 'faq' | 'config'
  targetId: string
  action: string
  actorLabel: string
  createdAt: string
  detail: string
}

export interface ProviderConfigProfile {
  id: string
  kind: ProviderKind
  label: string
  status: ProviderStatus
  maskedValue: string
  scope: 'global' | 'workspace'
  lastValidatedAt?: string
  syncState: 'idle' | 'pending' | 'ready' | 'attention'
  secretBacked: boolean
}

export interface TenantBrandProfile {
  tenantId: string
  workspaceId: string
  brandId: string
  brandName: string
  industry: string
  offerSummary: string
  primaryAudience: string
  budgetBand: string
  activeChannels: string[]
  successMetrics: string[]
  verificationStatus: 'canonical_seeded' | 'verified' | 'needs_owner_confirmation'
}

export interface AiContentOperation {
  id: string
  kind: AiContentOperationKind
  label: string
  description: string
  governed: boolean
}

export interface ContentStudioSnapshot {
  totalPages: number
  totalSections: number
  totalPromotions: number
  totalPeopleProfiles: number
  totalFaqEntries: number
  totalPublishVersions: number
  scheduledCount: number
  publishedCount: number
  aiOperationCount: number
}

export interface ProviderConfigSummary {
  totalProfiles: number
  connectedCount: number
  seededCount: number
  attentionCount: number
  maskedSecretsCount: number
}