import { organizationProfile, supportChannels } from './organization-profile'
import {
  commercialAgreements,
  commercialInvoices,
  getCommercialFoundationSnapshot,
  ledgerEntries
} from './commercial-foundation'
import {
  getAgreementIssuanceExperience,
  getCommercialDocumentAudit,
  getGstInvoiceRenderingExperience
} from './commercial-document-foundation'

export interface ClientCommercialDocumentCard {
  id: string
  type: 'agreement' | 'invoice'
  title: string
  status: string
  href: string
  amountLabel: string
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

export function getClientCommercialDashboardExperience(accountName: string) {
  const agreements = commercialAgreements.filter((agreement) => agreement.accountName === accountName)
  const invoices = commercialInvoices.filter((invoice) => invoice.accountName === accountName)
  const ledger = ledgerEntries.filter((entry) => entry.accountName === accountName)

  const receivablesInr =
    ledger
      .filter((entry) => entry.direction === 'debit')
      .reduce((sum, entry) => sum + entry.amountInr, 0) -
    ledger
      .filter((entry) => entry.direction === 'credit')
      .reduce((sum, entry) => sum + entry.amountInr, 0)

  const documentCards: ClientCommercialDocumentCard[] = [
    ...agreements.map((agreement) => ({
      id: agreement.id,
      type: 'agreement' as const,
      title: agreement.title,
      status: agreement.status,
      href: `/client/commercial/agreements/${agreement.id}`,
      amountLabel: `₹${agreement.valueInr.toLocaleString('en-IN')}`
    })),
    ...invoices.map((invoice) => ({
      id: invoice.id,
      type: 'invoice' as const,
      title: `Invoice ${invoice.invoiceNumber}`,
      status: invoice.status,
      href: `/client/commercial/invoices/${invoice.id}`,
      amountLabel: `₹${invoice.totalInr.toLocaleString('en-IN')}`
    }))
  ]

  return {
    title: 'Client commercial workspace',
    subtitle:
      'Commercial visibility for agreements, invoices, outstanding receivables, and governed support escalation.',
    accountName,
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      supportEmail: String(getSupportEmail()),
      supportPhone: String(getSupportPhone())
    },
    summaryCards: [
      { label: 'Agreements', value: String(agreements.length) },
      { label: 'Invoices', value: String(invoices.length) },
      { label: 'Outstanding receivables', value: `₹${receivablesInr.toLocaleString('en-IN')}` },
      { label: 'Ledger entries', value: String(ledger.length) }
    ],
    documentCards,
    actions: [
      { label: 'View agreements', href: '/client/commercial/agreements' },
      { label: 'View invoices', href: '/client/commercial/invoices' },
      { label: 'Raise billing support', href: '/contact' }
    ]
  }
}

export function getOperatorCommercialOperationsExperience() {
  const foundation = getCommercialFoundationSnapshot()
  const agreementIssuance = getAgreementIssuanceExperience()
  const issuedInvoice = getGstInvoiceRenderingExperience('inv-neejee-001')
  const draftInvoice = getGstInvoiceRenderingExperience('inv-neejee-002')
  const audit = getCommercialDocumentAudit()

  return {
    title: 'Commercial operations control',
    subtitle:
      'Operator command surface for agreement issuance, invoice governance, receivable review, and client-visible commercial truth.',
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      cin: organizationProfile.cin
    },
    summaryCards: [
      { label: 'Agreements', value: String(foundation.agreementCount) },
      { label: 'Invoices', value: String(foundation.invoiceCount) },
      { label: 'Outstanding receivables', value: `₹${foundation.outstandingReceivablesInr.toLocaleString('en-IN')}` },
      { label: 'Ledger entries', value: String(foundation.ledgerEntryCount) }
    ],
    operations: [
      {
        label: 'Agreement issuance',
        href: '/admin/commercial/agreements',
        detail: `${agreementIssuance.counts.issued} issued · ${agreementIssuance.counts.draft} draft`
      },
      {
        label: 'Invoice management',
        href: '/admin/commercial/invoices',
        detail: `${issuedInvoice.invoiceNumber} issued · ${draftInvoice.invoiceNumber} draft`
      },
      {
        label: 'Ledger visibility',
        href: '/admin/commercial/ledger',
        detail: `Outstanding ₹${foundation.outstandingReceivablesInr.toLocaleString('en-IN')}`
      }
    ],
    audit,
    supportIdentity: {
      email: String(getSupportEmail()),
      phone: String(getSupportPhone())
    }
  }
}