export const AGREEMENT_KINDS = [
  'proposal',
  'service_agreement',
  'scope_addendum',
  'invoice_attachment',
  'renewal_extension',
] as const

export type AgreementKind = (typeof AGREEMENT_KINDS)[number]

export const AGREEMENT_STATUSES = [
  'draft',
  'in_review',
  'approved',
  'issued',
  'viewed',
  'signed',
  'rejected',
  'expired',
  'archived',
] as const

export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number]

export const AGREEMENT_SIGNING_MODES = ['email', 'manual', 'hybrid'] as const
export type AgreementSigningMode = (typeof AGREEMENT_SIGNING_MODES)[number]

export const AGREEMENT_PARTY_ROLES = ['vendor', 'client', 'approver', 'signatory'] as const
export type AgreementPartyRole = (typeof AGREEMENT_PARTY_ROLES)[number]

export interface AgreementParty {
  role: AgreementPartyRole
  name: string
  email: string
  organization?: string
  title?: string
}

export interface AgreementLineItem {
  id: string
  label: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
}

export interface AgreementTemplateSection {
  id: string
  title: string
  required: boolean
  description?: string
}

export interface AgreementTemplate {
  id: string
  slug: string
  title: string
  kind: AgreementKind
  description: string
  requiredApprovals: number
  signingMode: AgreementSigningMode
  defaultValidityDays: number
  sections: AgreementTemplateSection[]
  defaultLineItems: AgreementLineItem[]
}

export interface AgreementRecord {
  id: string
  agreementNumber: string
  title: string
  templateId: string
  kind: AgreementKind
  status: AgreementStatus
  workspaceKey: string
  currency: string
  createdAt: string
  updatedAt: string
  effectiveDate: string
  expiresAt: string
  createdBy: string
  lastUpdatedBy: string
  parties: AgreementParty[]
  sections: AgreementTemplateSection[]
  lineItems: AgreementLineItem[]
  approvalCount: number
  approvalsRequired: number
  signingMode: AgreementSigningMode
  notes: string[]
  tags: string[]
}

export interface AgreementReadiness {
  issueReady: boolean
  signReady: boolean
  missing: string[]
}

export interface AgreementSummaryCard {
  id: string
  agreementNumber: string
  title: string
  kind: AgreementKind
  status: AgreementStatus
  workspaceKey: string
  clientName: string
  totalAmount: number
  expiresAt: string
  readiness: AgreementReadiness
}

export interface AgreementRegistrySummary {
  total: number
  templates: number
  expiringSoon: number
  byStatus: Record<AgreementStatus, number>
  byKind: Record<AgreementKind, number>
}