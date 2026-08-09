import { organizationProfile, supportChannels } from './organization-profile'
import {
  commercialAgreements,
  commercialInvoices,
  getCommercialFoundationSnapshot,
  ledgerEntries
} from './commercial-foundation'
import { getAgreementIssuanceExperience, getGstInvoiceRenderingExperience } from './commercial-document-foundation'

export interface InvoiceFollowUpItem {
  invoiceId: string
  invoiceNumber: string
  accountName: string
  status: 'draft' | 'issued' | 'paid' | 'overdue'
  resendEligible: boolean
  paymentFollowUpEligible: boolean
  outstandingAmountInr: number
  nextAction: string
}

export interface AgreementActivationHandoff {
  agreementId: string
  accountName: string
  agreementStatus: 'draft' | 'issued' | 'signed'
  invoiceActivationEligible: boolean
  handoffState: 'blocked' | 'ready_for_invoice' | 'already_invoiced'
  targetInvoiceNumber: string | null
  nextAction: string
}

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

export function getInvoiceFollowUpExperience() {
  const items: InvoiceFollowUpItem[] = commercialInvoices.map((invoice) => {
    const outstandingAmountInr = getOutstandingForAccount(invoice.accountName)
    const resendEligible = invoice.status === 'issued' || invoice.status === 'overdue'
    const paymentFollowUpEligible = resendEligible && outstandingAmountInr > 0

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      accountName: invoice.accountName,
      status: invoice.status,
      resendEligible,
      paymentFollowUpEligible,
      outstandingAmountInr,
      nextAction:
        invoice.status === 'draft'
          ? 'Complete review before invoice issuance.'
          : paymentFollowUpEligible
            ? 'Send governed reminder and payment follow-up.'
            : 'No follow-up required.'
    }
  })

  return {
    title: 'Invoice resend and payment follow-up',
    subtitle:
      'Governed commercial follow-up for issued invoices, receivable reminders, and support-safe client communication.',
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      supportEmail: String(getSupportEmail()),
      supportPhone: String(getSupportPhone())
    },
    counts: {
      totalInvoices: items.length,
      resendEligible: items.filter((item) => item.resendEligible).length,
      paymentFollowUpEligible: items.filter((item) => item.paymentFollowUpEligible).length,
      draftReviewRequired: items.filter((item) => item.status === 'draft').length
    },
    items
  }
}

export function getAgreementActivationHandoffExperience() {
  const issuance = getAgreementIssuanceExperience()

  const handoffs: AgreementActivationHandoff[] = issuance.agreements.map((agreement) => {
    const linkedInvoice = commercialInvoices.find((invoice) => invoice.accountName === agreement.accountName)

    if (agreement.status === 'draft') {
      return {
        agreementId: agreement.agreementId,
        accountName: agreement.accountName,
        agreementStatus: agreement.status,
        invoiceActivationEligible: false,
        handoffState: 'blocked',
        targetInvoiceNumber: null,
        nextAction: 'Agreement must be issued or signed before invoice activation.'
      }
    }

    if (linkedInvoice) {
      return {
        agreementId: agreement.agreementId,
        accountName: agreement.accountName,
        agreementStatus: agreement.status,
        invoiceActivationEligible: true,
        handoffState: 'already_invoiced',
        targetInvoiceNumber: linkedInvoice.invoiceNumber,
        nextAction: 'Track invoice state and receivable collection from the existing invoice.'
      }
    }

    return {
      agreementId: agreement.agreementId,
      accountName: agreement.accountName,
      agreementStatus: agreement.status,
      invoiceActivationEligible: true,
      handoffState: 'ready_for_invoice',
      targetInvoiceNumber: null,
      nextAction: 'Activate invoice creation from the governed commercial handoff.'
    }
  })

  return {
    title: 'Agreement to invoice activation handoff',
    subtitle:
      'Commercial activation bridge between governed agreement issuance, verified activation inputs, and invoice generation readiness.',
    legalIdentity: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      cin: organizationProfile.cin
    },
    counts: {
      total: handoffs.length,
      blocked: handoffs.filter((handoff) => handoff.handoffState === 'blocked').length,
      readyForInvoice: handoffs.filter((handoff) => handoff.handoffState === 'ready_for_invoice').length,
      alreadyInvoiced: handoffs.filter((handoff) => handoff.handoffState === 'already_invoiced').length
    },
    handoffs
  }
}

export function getCommercialFulfillmentAudit() {
  const foundation = getCommercialFoundationSnapshot()
  const invoiceFollowUp = getInvoiceFollowUpExperience()
  const agreementHandoff = getAgreementActivationHandoffExperience()
  const issuedInvoice = getGstInvoiceRenderingExperience('inv-neejee-001')

  return {
    legalName: organizationProfile.legalName,
    gstin: organizationProfile.gstin,
    outstandingReceivablesInr: foundation.outstandingReceivablesInr,
    resendEligibleCount: invoiceFollowUp.counts.resendEligible,
    paymentFollowUpEligibleCount: invoiceFollowUp.counts.paymentFollowUpEligible,
    blockedAgreementCount: agreementHandoff.counts.blocked,
    alreadyInvoicedAgreementCount: agreementHandoff.counts.alreadyInvoiced,
    issuedInvoiceNumber: issuedInvoice.invoiceNumber,
    issuedInvoiceSupportEmail: issuedInvoice.issuer.supportEmail
  }
}