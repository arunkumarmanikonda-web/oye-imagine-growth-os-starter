import { findAgreementById } from '../agreements/agreement-registry'
import { applyInvoicePayment, buildInvoiceDraft, toInvoiceSummaryCard, transitionInvoiceStatus } from './gst-engine'
import type { InvoiceKind, InvoiceRecord, InvoiceRegistrySummary, InvoiceStatus, InvoiceSummaryCard } from './invoice-types'

function createStatusCounter(): Record<InvoiceStatus, number> {
  return {
    draft: 0,
    approved: 0,
    issued: 0,
    partially_paid: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
    void: 0,
  }
}

function createKindCounter(): Record<InvoiceKind, number> {
  return {
    tax_invoice: 0,
    proforma_invoice: 0,
    credit_note: 0,
  }
}

const neejeeAgreement = findAgreementById('agreement-neejee-2')
const rocketBoysAgreement = findAgreementById('agreement-rocketboys-3')
const cleverCareAgreement = findAgreementById('agreement-clevercare-4')

const neejeeDraft = buildInvoiceDraft({
  workspaceKey: 'neejee',
  clientName: 'Neejee',
  clientEmail: 'finance@neejee.com',
  clientGstin: '09ABCDE1234F1Z5',
  clientAddressLine: 'Noida, Uttar Pradesh',
  sourceAgreementId: neejeeAgreement?.id,
  sourceAgreementNumber: neejeeAgreement?.agreementNumber,
  title: 'Neejee July Retainer Invoice',
  createdBy: 'finance@oyeimagine.com',
  createdAt: '2026-07-30T14:00:00.000Z',
  issueDate: '2026-07-30T14:00:00.000Z',
  sequence: 1,
  lineItems: [
    {
      id: 'neejee-retainer',
      label: 'Growth Operating Retainer',
      description: 'Monthly growth execution retainer',
      quantity: 1,
      unitPrice: 125000,
      gstRate: 18,
      hsnSac: '998361',
    },
    {
      id: 'neejee-reporting',
      label: 'Board Reporting Pack',
      description: 'Monthly reporting and review pack',
      quantity: 1,
      unitPrice: 15000,
      gstRate: 18,
      hsnSac: '998361',
    },
  ],
})

const neejeeApproved = transitionInvoiceStatus(neejeeDraft, 'approved', 'finance-lead@oyeimagine.com', '2026-07-30T14:30:00.000Z')
const neejeeIssued = transitionInvoiceStatus(neejeeApproved, 'issued', 'finance@oyeimagine.com', '2026-07-30T15:00:00.000Z')

const rocketBoysDraft = buildInvoiceDraft({
  workspaceKey: 'rocketboys',
  clientName: 'Rocket Boys',
  clientEmail: 'accounts@rocketboys.in',
  clientGstin: '27ABCDE1234F1Z5',
  clientAddressLine: 'Mumbai, Maharashtra',
  sourceAgreementId: rocketBoysAgreement?.id,
  sourceAgreementNumber: rocketBoysAgreement?.agreementNumber,
  title: 'Rocket Boys Addendum Invoice',
  createdBy: 'finance@oyeimagine.com',
  createdAt: '2026-07-28T11:00:00.000Z',
  issueDate: '2026-07-28T11:00:00.000Z',
  sequence: 2,
  lineItems: [
    {
      id: 'rocketboys-addendum',
      label: 'Performance Sprint Addendum',
      description: 'Additional paid sprint attached to scope addendum',
      quantity: 1,
      unitPrice: 28000,
      gstRate: 18,
      hsnSac: '998365',
    },
  ],
})
const rocketBoysApproved = transitionInvoiceStatus(rocketBoysDraft, 'approved', 'finance-lead@oyeimagine.com', '2026-07-28T12:00:00.000Z')
const rocketBoysIssued = transitionInvoiceStatus(rocketBoysApproved, 'issued', 'finance@oyeimagine.com', '2026-07-28T12:30:00.000Z')
const rocketBoysPartial = applyInvoicePayment(rocketBoysIssued, 15000, 'collections@oyeimagine.com', '2026-07-29T09:00:00.000Z')

const cleverCareDraft = buildInvoiceDraft({
  workspaceKey: 'clevercare',
  clientName: 'CleverCare',
  clientEmail: 'accounts@clevercare.in',
  clientGstin: '29ABCDE1234F1Z5',
  clientAddressLine: 'Bengaluru, Karnataka',
  sourceAgreementId: cleverCareAgreement?.id,
  sourceAgreementNumber: cleverCareAgreement?.agreementNumber,
  title: 'CleverCare Renewal Invoice',
  createdBy: 'finance@oyeimagine.com',
  createdAt: '2026-07-20T10:30:00.000Z',
  issueDate: '2026-07-20T10:30:00.000Z',
  sequence: 3,
  lineItems: [
    {
      id: 'clevercare-renewal',
      label: 'Renewal Quarter',
      description: 'Quarterly renewal continuation',
      quantity: 1,
      unitPrice: 180000,
      gstRate: 18,
      hsnSac: '998361',
    },
  ],
})
const cleverCareApproved = transitionInvoiceStatus(cleverCareDraft, 'approved', 'finance-lead@oyeimagine.com', '2026-07-20T11:00:00.000Z')
const cleverCareIssued = transitionInvoiceStatus(cleverCareApproved, 'issued', 'finance@oyeimagine.com', '2026-07-20T11:30:00.000Z')
const cleverCarePaid = applyInvoicePayment(cleverCareIssued, cleverCareIssued.totalAmount, 'collections@oyeimagine.com', '2026-07-21T10:00:00.000Z')

const proformaDraft = buildInvoiceDraft({
  workspaceKey: 'neejee',
  clientName: 'Neejee',
  clientEmail: 'ops@neejee.com',
  clientGstin: '09ABCDE1234F1Z5',
  clientAddressLine: 'Noida, Uttar Pradesh',
  title: 'Neejee August Proforma',
  kind: 'proforma_invoice',
  createdBy: 'finance@oyeimagine.com',
  createdAt: '2026-07-31T09:00:00.000Z',
  issueDate: '2026-07-31T09:00:00.000Z',
  sequence: 4,
  lineItems: [
    {
      id: 'neejee-proforma',
      label: 'Advance Media Planning',
      description: 'Proforma before campaign launch',
      quantity: 1,
      unitPrice: 50000,
      gstRate: 18,
      hsnSac: '998366',
    },
  ],
})

export const INVOICE_REGISTRY: InvoiceRecord[] = [
  neejeeIssued,
  rocketBoysPartial,
  cleverCarePaid,
  proformaDraft,
]

export function getInvoiceRegistry(): InvoiceRecord[] {
  return INVOICE_REGISTRY
}

export function findInvoiceById(invoiceId: string): InvoiceRecord | undefined {
  return INVOICE_REGISTRY.find((record) => record.id === invoiceId)
}

export function getInvoiceSummaryCards(): InvoiceSummaryCard[] {
  return INVOICE_REGISTRY.map(toInvoiceSummaryCard)
}

export function getInvoiceRegistrySummary(): InvoiceRegistrySummary {
  const byStatus = createStatusCounter()
  const byKind = createKindCounter()

  let issuedValue = 0
  let outstandingValue = 0
  let overdueCount = 0

  for (const record of INVOICE_REGISTRY) {
    byStatus[record.status] += 1
    byKind[record.kind] += 1

    issuedValue += record.totalAmount
    outstandingValue += record.payment.balanceAmount

    if (record.status === 'overdue') {
      overdueCount += 1
    }
  }

  return {
    total: INVOICE_REGISTRY.length,
    issuedValue: Math.round(issuedValue * 100) / 100,
    outstandingValue: Math.round(outstandingValue * 100) / 100,
    overdueCount,
    byStatus,
    byKind,
  }
}