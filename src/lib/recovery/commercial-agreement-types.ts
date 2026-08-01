export const COMMERCIAL_PARTY_ROLES = ['provider', 'client', 'approver', 'signatory'] as const
export const COMMERCIAL_BILLING_MODELS = ['monthly_retainer', 'project_fixed_fee', 'milestone_based'] as const
export const COMMERCIAL_SCOPE_LANES = [
  'growth_strategy',
  'performance_marketing',
  'seo_content',
  'marketplace_specialist',
  'reporting_support',
] as const
export const COMMERCIAL_APPROVAL_STAGES = [
  'intake_review',
  'commercial_review',
  'legal_review',
  'signature_ready',
] as const
export const COMMERCIAL_AGREEMENT_STATUSES = [
  'draft',
  'intake_ready',
  'review_ready',
  'signature_pending',
  'active',
] as const
export const COMMERCIAL_PAYMENT_TERMS = ['advance', 'net_15', 'net_30'] as const

export type CommercialPartyRole = (typeof COMMERCIAL_PARTY_ROLES)[number]
export type CommercialBillingModel = (typeof COMMERCIAL_BILLING_MODELS)[number]
export type CommercialScopeLane = (typeof COMMERCIAL_SCOPE_LANES)[number]
export type CommercialApprovalStage = (typeof COMMERCIAL_APPROVAL_STAGES)[number]
export type CommercialAgreementStatus = (typeof COMMERCIAL_AGREEMENT_STATUSES)[number]
export type CommercialPaymentTerm = (typeof COMMERCIAL_PAYMENT_TERMS)[number]