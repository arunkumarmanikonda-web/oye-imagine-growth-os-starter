import { buildAgreementDraft, toAgreementSummaryCard, transitionAgreementStatus } from './agreement-engine'
import { getAgreementTemplates } from './agreement-templates'
import type {
  AgreementKind,
  AgreementRecord,
  AgreementRegistrySummary,
  AgreementStatus,
  AgreementSummaryCard,
} from './agreement-types'

function createStatusCounter(): Record<AgreementStatus, number> {
  return {
    draft: 0,
    in_review: 0,
    approved: 0,
    issued: 0,
    viewed: 0,
    signed: 0,
    rejected: 0,
    expired: 0,
    archived: 0,
  }
}

function createKindCounter(): Record<AgreementKind, number> {
  return {
    proposal: 0,
    service_agreement: 0,
    scope_addendum: 0,
    invoice_attachment: 0,
    renewal_extension: 0,
  }
}

function countExpiringSoon(records: AgreementRecord[], referenceDate = '2026-08-01T00:00:00.000Z', windowDays = 14): number {
  const start = new Date(referenceDate).getTime()
  const end = start + windowDays * 24 * 60 * 60 * 1000

  return records.filter((record) => {
    const expiresAt = new Date(record.expiresAt).getTime()
    return expiresAt >= start && expiresAt <= end
  }).length
}

const proposalDraft = buildAgreementDraft({
  templateId: 'agreement-template-proposal',
  workspaceKey: 'neejee',
  clientName: 'Neejee',
  clientEmail: 'ops@neejee.com',
  clientOrganization: 'Neejee',
  createdBy: 'admin@oyeimagine.com',
  createdAt: '2026-07-30T09:00:00.000Z',
  sequence: 1,
  titleOverride: 'Neejee Growth Proposal Q3',
  notes: ['Initial commercial proposal for batch onboarding.'],
})

const serviceDraft = buildAgreementDraft({
  templateId: 'agreement-template-service',
  workspaceKey: 'neejee',
  clientName: 'Neejee',
  clientEmail: 'finance@neejee.com',
  clientOrganization: 'Neejee',
  createdBy: 'admin@oyeimagine.com',
  createdAt: '2026-07-30T10:00:00.000Z',
  sequence: 2,
  titleOverride: 'Neejee Master Service Agreement',
})

const serviceInReview = transitionAgreementStatus(serviceDraft, 'in_review', 'legal@oyeimagine.com', '2026-07-30T11:00:00.000Z')
const serviceApproved = transitionAgreementStatus(serviceInReview, 'approved', 'director@oyeimagine.com', '2026-07-30T12:00:00.000Z')
const serviceIssued = transitionAgreementStatus(serviceApproved, 'issued', 'ops@oyeimagine.com', '2026-07-30T13:00:00.000Z')

const addendumDraft = buildAgreementDraft({
  templateId: 'agreement-template-addendum',
  workspaceKey: 'rocketboys',
  clientName: 'Rocket Boys',
  clientEmail: 'founder@rocketboys.in',
  clientOrganization: 'Rocket Boys',
  createdBy: 'admin@oyeimagine.com',
  createdAt: '2026-07-28T09:30:00.000Z',
  sequence: 3,
  titleOverride: 'Rocket Boys Scope Addendum – Performance Sprint',
})
const addendumInReview = transitionAgreementStatus(addendumDraft, 'in_review', 'ops@oyeimagine.com', '2026-07-28T10:00:00.000Z')

const renewalDraft = buildAgreementDraft({
  templateId: 'agreement-template-renewal',
  workspaceKey: 'clevercare',
  clientName: 'CleverCare',
  clientEmail: 'ceo@clevercare.in',
  clientOrganization: 'CleverCare',
  createdBy: 'admin@oyeimagine.com',
  createdAt: '2026-07-20T08:00:00.000Z',
  sequence: 4,
  titleOverride: 'CleverCare Renewal Extension',
})
const renewalInReview = transitionAgreementStatus(renewalDraft, 'in_review', 'ops@oyeimagine.com', '2026-07-20T09:00:00.000Z')
const renewalApproved = transitionAgreementStatus(renewalInReview, 'approved', 'director@oyeimagine.com', '2026-07-20T09:30:00.000Z')
const renewalIssued = transitionAgreementStatus(renewalApproved, 'issued', 'ops@oyeimagine.com', '2026-07-20T10:00:00.000Z')
const renewalViewed = transitionAgreementStatus(renewalIssued, 'viewed', 'client@clevercare.in', '2026-07-21T10:00:00.000Z')
const renewalSigned = transitionAgreementStatus(renewalViewed, 'signed', 'client@clevercare.in', '2026-07-21T12:00:00.000Z')

export const AGREEMENT_REGISTRY: AgreementRecord[] = [
  proposalDraft,
  serviceIssued,
  addendumInReview,
  renewalSigned,
]

export function getAgreementRegistry(): AgreementRecord[] {
  return AGREEMENT_REGISTRY
}

export function findAgreementById(agreementId: string): AgreementRecord | undefined {
  return AGREEMENT_REGISTRY.find((record) => record.id === agreementId)
}

export function getAgreementSummaryCards(): AgreementSummaryCard[] {
  return AGREEMENT_REGISTRY.map(toAgreementSummaryCard)
}

export function getAgreementRegistrySummary(): AgreementRegistrySummary {
  const byStatus = createStatusCounter()
  const byKind = createKindCounter()

  for (const record of AGREEMENT_REGISTRY) {
    byStatus[record.status] += 1
    byKind[record.kind] += 1
  }

  return {
    total: AGREEMENT_REGISTRY.length,
    templates: getAgreementTemplates().length,
    expiringSoon: countExpiringSoon(AGREEMENT_REGISTRY),
    byStatus,
    byKind,
  }
}