import { getAgreementTemplateById } from './agreement-templates'
import type {
  AgreementParty,
  AgreementReadiness,
  AgreementRecord,
  AgreementStatus,
  AgreementSummaryCard,
} from './agreement-types'

export interface BuildAgreementDraftInput {
  templateId: string
  workspaceKey: string
  clientName: string
  clientEmail: string
  clientOrganization?: string
  createdBy: string
  currency?: string
  createdAt?: string
  effectiveDate?: string
  validityDaysOverride?: number
  sequence?: number
  titleOverride?: string
  notes?: string[]
  tags?: string[]
}

export const ALLOWED_STATUS_TRANSITIONS: Record<AgreementStatus, AgreementStatus[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['approved', 'rejected', 'draft', 'archived'],
  approved: ['issued', 'archived'],
  issued: ['viewed', 'expired', 'archived'],
  viewed: ['signed', 'expired', 'archived'],
  signed: ['archived'],
  rejected: ['draft', 'archived'],
  expired: ['archived'],
  archived: [],
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function addDays(dateIso: string, days: number): string {
  const date = new Date(dateIso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

export function calculateAgreementTotal(record: Pick<AgreementRecord, 'lineItems'>): number {
  return record.lineItems.reduce((sum, item) => sum + item.amount, 0)
}

export function canTransitionAgreementStatus(
  currentStatus: AgreementStatus,
  nextStatus: AgreementStatus,
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)
}

export function getAgreementReadiness(record: AgreementRecord): AgreementReadiness {
  const missing: string[] = []

  if (record.lineItems.length === 0) {
    missing.push('line_items')
  }

  if (record.sections.filter((section) => section.required).length === 0) {
    missing.push('required_sections')
  }

  if (record.approvalCount < record.approvalsRequired) {
    missing.push('approvals')
  }

  const hasClientParty = record.parties.some((party) => party.role === 'client' || party.role === 'signatory')
  if (!hasClientParty) {
    missing.push('client_signatory')
  }

  return {
    issueReady: !missing.includes('line_items') && !missing.includes('required_sections'),
    signReady:
      (record.status === 'issued' || record.status === 'viewed') &&
      !missing.includes('line_items') &&
      !missing.includes('required_sections') &&
      !missing.includes('approvals') &&
      !missing.includes('client_signatory'),
    missing,
  }
}

export function buildAgreementDraft(input: BuildAgreementDraftInput): AgreementRecord {
  const template = getAgreementTemplateById(input.templateId)
  if (!template) {
    throw new Error(`Unknown agreement template: ${input.templateId}`)
  }

  const createdAt = input.createdAt ?? new Date().toISOString()
  const effectiveDate = input.effectiveDate ?? createdAt
  const validityDays = input.validityDaysOverride ?? template.defaultValidityDays
  const sequence = input.sequence ?? 1
  const ymd = createdAt.slice(0, 10).replace(/-/g, '')
  const workspaceSlug = slugify(input.workspaceKey)
  const agreementNumber = `AGR-${workspaceSlug.toUpperCase()}-${ymd}-${String(sequence).padStart(3, '0')}`

  const vendorParty: AgreementParty = {
    role: 'vendor',
    name: 'Oye Imagine',
    email: 'hello@oyeimagine.com',
    organization: 'Oye Imagine Private Limited',
    title: 'Service Provider',
  }

  const clientParty: AgreementParty = {
    role: 'client',
    name: input.clientName,
    email: input.clientEmail,
    organization: input.clientOrganization ?? input.clientName,
    title: 'Client',
  }

  return {
    id: `agreement-${workspaceSlug}-${sequence}`,
    agreementNumber,
    title: input.titleOverride ?? template.title,
    templateId: template.id,
    kind: template.kind,
    status: 'draft',
    workspaceKey: workspaceSlug,
    currency: input.currency ?? 'INR',
    createdAt,
    updatedAt: createdAt,
    effectiveDate,
    expiresAt: addDays(effectiveDate, validityDays),
    createdBy: input.createdBy,
    lastUpdatedBy: input.createdBy,
    parties: [vendorParty, clientParty],
    sections: template.sections,
    lineItems: template.defaultLineItems,
    approvalCount: 0,
    approvalsRequired: template.requiredApprovals,
    signingMode: template.signingMode,
    notes: input.notes ?? [],
    tags: input.tags ?? [template.kind, workspaceSlug],
  }
}

export function transitionAgreementStatus(
  record: AgreementRecord,
  nextStatus: AgreementStatus,
  actor: string,
  changedAt?: string,
): AgreementRecord {
  if (!canTransitionAgreementStatus(record.status, nextStatus)) {
    throw new Error(`Invalid agreement transition: ${record.status} -> ${nextStatus}`)
  }

  const updatedAt = changedAt ?? new Date().toISOString()
  const nextApprovalCount =
    nextStatus === 'approved'
      ? Math.max(record.approvalCount, record.approvalsRequired)
      : record.approvalCount

  return {
    ...record,
    status: nextStatus,
    approvalCount: nextApprovalCount,
    updatedAt,
    lastUpdatedBy: actor,
  }
}

export function toAgreementSummaryCard(record: AgreementRecord): AgreementSummaryCard {
  const clientParty = record.parties.find((party) => party.role === 'client' || party.role === 'signatory')

  return {
    id: record.id,
    agreementNumber: record.agreementNumber,
    title: record.title,
    kind: record.kind,
    status: record.status,
    workspaceKey: record.workspaceKey,
    clientName: clientParty?.name ?? 'Unknown client',
    totalAmount: calculateAgreementTotal(record),
    expiresAt: record.expiresAt,
    readiness: getAgreementReadiness(record),
  }
}