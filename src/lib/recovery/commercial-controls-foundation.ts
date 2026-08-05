import { organizationProfile, supportChannels } from './organization-profile'
import { ledgerEntries } from './commercial-foundation'
import { getCommercialCollectionsAudit } from './commercial-collections-foundation'

export type CommercialHoldStatus = 'active' | 'released'
export type CommercialBlockedArea = 'invoice_dispatch' | 'service_activation' | 'collections_release'
export type RemittanceValidationStatus = 'submitted' | 'verified' | 'rejected'

export interface CommercialHold {
  id: string
  accountName: string
  status: CommercialHoldStatus
  blockedArea: CommercialBlockedArea
  reason: string
  outstandingAmountInr: number
  releaseCondition: string
}

export interface RemittanceSubmission {
  id: string
  accountName: string
  invoiceNumber: string
  amountInr: number
  submittedAt: string
  status: RemittanceValidationStatus
  reference: string
  note: string
}

export const commercialHolds: CommercialHold[] = [
  {
    id: 'hold-001',
    accountName: 'Neejee',
    status: 'active',
    blockedArea: 'service_activation',
    reason: 'Outstanding commercial receivable requires controlled release review before further activation.',
    outstandingAmountInr: 68000,
    releaseCondition: 'Validate remittance and confirm finance release against canonical invoice and ledger truth.'
  },
  {
    id: 'hold-002',
    accountName: 'Marketplace Prospect',
    status: 'released',
    blockedArea: 'invoice_dispatch',
    reason: 'Invoice dispatch remained gated while agreement was still commercially incomplete.',
    outstandingAmountInr: 0,
    releaseCondition: 'Released after commercial review confirmed that no active invoice dispatch was required.'
  }
]

export const remittanceSubmissions: RemittanceSubmission[] = [
  {
    id: 'remit-001',
    accountName: 'Neejee',
    invoiceNumber: 'OI-2026-001',
    amountInr: 68000,
    submittedAt: '2026-08-01T10:15:00.000Z',
    status: 'submitted',
    reference: 'UTR-NEEJEE-001',
    note: 'Client shared remittance advice and finance verification is pending.'
  }
]

function getSupportEmail() {
  return (
    supportChannels.find((channel) => String(channel.value).includes('@'))?.value ??
    'hello@oyeimagine.com'
  )
}

function getSupportPhone() {
  return (
    supportChannels.find((channel) => String(channel.value).includes('+91'))?.value ??
    '+91 8 988 988 988'
  )
}

function getOutstandingForAccount(accountName: string) {
  const debit = ledgerEntries
    .filter((entry) => entry.accountName === accountName && entry.direction === 'debit')
    .reduce((sum, entry) => sum + entry.amountInr, 0)

  const credit = ledgerEntries
    .filter((entry) => entry.accountName === accountName && entry.direction === 'credit')
    .reduce((sum, entry) => sum + entry.amountInr, 0)

  return debit - credit
}

export function getCommercialControlsExperience() {
  return {
    title: 'Commercial controls and release governance',
    subtitle:
      'Operator-governed holds, release conditions, remittance validation, and verified commercial activation checks before account progression.',
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      cin: organizationProfile.cin
    },
    supportIdentity: {
      email: String(getSupportEmail()),
      phone: String(getSupportPhone())
    },
    counts: {
      totalHolds: commercialHolds.length,
      activeHolds: commercialHolds.filter((entry) => entry.status === 'active').length,
      releasedHolds: commercialHolds.filter((entry) => entry.status === 'released').length,
      remittanceSubmissions: remittanceSubmissions.length,
      pendingRemittanceValidations: remittanceSubmissions.filter((entry) => entry.status === 'submitted').length
    },
    holds: commercialHolds,
    remittances: remittanceSubmissions,
    governanceRules: [
      'Active holds must clearly state the blocked area and release condition.',
      'Remittance submissions must remain reviewable before any commercial release action.',
      'Commercial release decisions must remain bound to canonical legal identity and ledger truth.'
    ]
  }
}

export function getClientRemittanceExperience(accountName: string) {
  const submissions = remittanceSubmissions.filter((entry) => entry.accountName === accountName)
  const outstandingReceivablesInr = getOutstandingForAccount(accountName)

  return {
    title: 'Client remittance validation',
    subtitle:
      'Client-facing remittance submission and verification visibility for governed collections and release coordination.',
    accountName,
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      supportEmail: String(getSupportEmail()),
      supportPhone: String(getSupportPhone())
    },
    summaryCards: [
      { label: 'Outstanding receivables', value: `₹${outstandingReceivablesInr.toLocaleString('en-IN')}` },
      { label: 'Submitted remittances', value: String(submissions.filter((entry) => entry.status === 'submitted').length) },
      { label: 'Verified remittances', value: String(submissions.filter((entry) => entry.status === 'verified').length) },
      { label: 'Rejected remittances', value: String(submissions.filter((entry) => entry.status === 'rejected').length) }
    ],
    actions: [
      { label: 'Submit remittance proof', href: '/client/commercial/remittance' },
      { label: 'Review payment commitments', href: '/client/commercial/payments' },
      { label: 'Contact billing support', href: '/contact' }
    ],
    submissions
  }
}

export function getCommercialControlsAudit() {
  const controls = getCommercialControlsExperience()
  const clientRemittance = getClientRemittanceExperience('Neejee')
  const collectionsAudit = getCommercialCollectionsAudit()

  return {
    legalName: organizationProfile.legalName,
    gstin: organizationProfile.gstin,
    activeHolds: controls.counts.activeHolds,
    releasedHolds: controls.counts.releasedHolds,
    pendingRemittanceValidations: controls.counts.pendingRemittanceValidations,
    outstandingReceivablesInr: collectionsAudit.outstandingReceivablesInr,
    activeClientRemittances: clientRemittance.submissions.filter((entry) => entry.status === 'submitted').length,
    supportEmail: String(getSupportEmail()),
    supportPhone: String(getSupportPhone())
  }
}