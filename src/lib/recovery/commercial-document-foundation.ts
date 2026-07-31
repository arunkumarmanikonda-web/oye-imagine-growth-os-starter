import { organizationProfile, supportChannels } from './organization-profile'
import {
  commercialAgreements,
  commercialInvoices,
  getCommercialFoundationSnapshot
} from './commercial-foundation'

export interface AgreementIssuancePacket {
  agreementId: string
  accountName: string
  title: string
  status: 'draft' | 'issued' | 'signed'
  signingMode: 'e-sign'
  signingProvider: 'operator-esign'
  contractValueInr: number
  issuerLegalName: string
  issuerGstin: string
}

export interface RenderedInvoiceLineItem {
  description: string
  amountInr: number
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

export function getAgreementIssuanceExperience() {
  const agreementPackets: AgreementIssuancePacket[] = commercialAgreements.map((agreement) => ({
    agreementId: agreement.id,
    accountName: agreement.accountName,
    title: agreement.title,
    status: agreement.status,
    signingMode: agreement.signingMode,
    signingProvider: 'operator-esign',
    contractValueInr: agreement.valueInr,
    issuerLegalName: organizationProfile.legalName,
    issuerGstin: organizationProfile.gstin
  }))

  return {
    title: 'Agreement issuance control',
    subtitle:
      'Operator-governed agreement preparation, issuance, and e-sign readiness for client and marketplace commercial flows.',
    legalIdentity: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      cin: organizationProfile.cin
    },
    supportIdentity: {
      email: String(getSupportEmail()),
      phone: String(getSupportPhone())
    },
    counts: {
      total: agreementPackets.length,
      draft: agreementPackets.filter((packet) => packet.status === 'draft').length,
      issued: agreementPackets.filter((packet) => packet.status === 'issued').length,
      signed: agreementPackets.filter((packet) => packet.status === 'signed').length
    },
    steps: [
      'Prepare governed agreement terms under canonical legal identity',
      'Issue agreement through operator-controlled e-sign path',
      'Track signature state before invoice activation',
      'Expose agreement visibility to the correct client account'
    ],
    agreements: agreementPackets
  }
}

export function getGstInvoiceRenderingExperience(invoiceId: string) {
  const invoice = commercialInvoices.find((entry) => entry.id === invoiceId)
  if (!invoice) {
    throw new Error(`Invoice '${invoiceId}' not found.`)
  }

  const lineItems: RenderedInvoiceLineItem[] = [
    {
      description: `Growth Operating System services for ${invoice.accountName}`,
      amountInr: invoice.subtotalInr
    }
  ]

  return {
    title: 'GST invoice rendering',
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    accountName: invoice.accountName,
    status: invoice.status,
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      pan: organizationProfile.pan,
      addressLine1: organizationProfile.principalPlaceOfBusiness.addressLine1,
      city: organizationProfile.principalPlaceOfBusiness.city,
      state: organizationProfile.principalPlaceOfBusiness.state,
      postalCode: organizationProfile.principalPlaceOfBusiness.postalCode,
      supportEmail: String(getSupportEmail()),
      supportPhone: String(getSupportPhone())
    },
    taxation: {
      gstRate: invoice.gstRate,
      gstPercentageLabel: `${invoice.gstRate * 100}%`,
      gstAmountInr: invoice.gstAmountInr
    },
    amounts: {
      subtotalInr: invoice.subtotalInr,
      totalInr: invoice.totalInr
    },
    lineItems,
    complianceMarkers: [
      'GST invoice generated under canonical issuer identity',
      'Totals must reconcile with ledger-visible receivable state',
      'Commercial email delivery uses governed support identity'
    ]
  }
}

export function getCommercialDocumentAudit() {
  const foundation = getCommercialFoundationSnapshot()
  const issuedInvoice = getGstInvoiceRenderingExperience('inv-neejee-001')
  const draftInvoice = getGstInvoiceRenderingExperience('inv-neejee-002')
  const agreementIssuance = getAgreementIssuanceExperience()

  return {
    foundation,
    agreementIssuanceCounts: agreementIssuance.counts,
    issuedInvoiceNumber: issuedInvoice.invoiceNumber,
    draftInvoiceNumber: draftInvoice.invoiceNumber,
    issuedInvoiceTotalInr: issuedInvoice.amounts.totalInr,
    draftInvoiceTotalInr: draftInvoice.amounts.totalInr
  }
}