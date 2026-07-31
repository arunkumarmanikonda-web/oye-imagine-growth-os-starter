import { organizationProfile } from './organization-profile'
import { getCommercialFoundationSnapshot } from './commercial-foundation'
import {
  getAgreementIssuanceExperience,
  getCommercialDocumentAudit,
  getGstInvoiceRenderingExperience
} from './commercial-document-foundation'
import {
  getClientCommercialDashboardExperience,
  getOperatorCommercialOperationsExperience
} from './commercial-operations-foundation'
import {
  getAgreementActivationHandoffExperience,
  getCommercialFulfillmentAudit,
  getInvoiceFollowUpExperience
} from './commercial-fulfillment-foundation'

export function getMegaBatchBClosureAudit() {
  const foundation = getCommercialFoundationSnapshot()
  const agreementIssuance = getAgreementIssuanceExperience()
  const issuedInvoice = getGstInvoiceRenderingExperience('inv-neejee-001')
  const draftInvoice = getGstInvoiceRenderingExperience('inv-neejee-002')
  const documentAudit = getCommercialDocumentAudit()
  const clientCommercial = getClientCommercialDashboardExperience('Neejee')
  const operatorCommercial = getOperatorCommercialOperationsExperience()
  const invoiceFollowUp = getInvoiceFollowUpExperience()
  const agreementActivation = getAgreementActivationHandoffExperience()
  const fulfillmentAudit = getCommercialFulfillmentAudit()

  return {
    batch: 'Mega Batch B',
    branchExpectation: 'mega-batch-b-commercial-os',
    legalIdentity: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      cin: organizationProfile.cin,
      pan: organizationProfile.pan,
      tan: organizationProfile.tan
    },
    foundation: {
      agreementCount: foundation.agreementCount,
      invoiceCount: foundation.invoiceCount,
      ledgerEntryCount: foundation.ledgerEntryCount,
      outstandingReceivablesInr: foundation.outstandingReceivablesInr
    },
    agreementIssuance: {
      total: agreementIssuance.counts.total,
      draft: agreementIssuance.counts.draft,
      issued: agreementIssuance.counts.issued,
      signed: agreementIssuance.counts.signed,
      signingProviders: agreementIssuance.agreements.map((agreement) => agreement.signingProvider)
    },
    invoiceRendering: {
      issuedInvoiceNumber: issuedInvoice.invoiceNumber,
      issuedInvoiceTotalInr: issuedInvoice.amounts.totalInr,
      draftInvoiceNumber: draftInvoice.invoiceNumber,
      draftInvoiceTotalInr: draftInvoice.amounts.totalInr,
      supportEmail: issuedInvoice.issuer.supportEmail
    },
    clientCommercial: {
      accountName: clientCommercial.accountName,
      summaryValues: clientCommercial.summaryCards.map((card) => card.value),
      actionPaths: clientCommercial.actions.map((action) => action.href),
      documentCount: clientCommercial.documentCards.length
    },
    operatorCommercial: {
      summaryValues: operatorCommercial.summaryCards.map((card) => card.value),
      operationPaths: operatorCommercial.operations.map((operation) => operation.href),
      providerInvoiceNumbers: [
        operatorCommercial.audit.issuedInvoiceNumber,
        operatorCommercial.audit.draftInvoiceNumber
      ],
      supportIdentity: operatorCommercial.supportIdentity
    },
    fulfillment: {
      resendEligibleCount: invoiceFollowUp.counts.resendEligible,
      paymentFollowUpEligibleCount: invoiceFollowUp.counts.paymentFollowUpEligible,
      blockedAgreementCount: agreementActivation.counts.blocked,
      readyForInvoiceCount: agreementActivation.counts.readyForInvoice,
      alreadyInvoicedAgreementCount: agreementActivation.counts.alreadyInvoiced,
      outstandingReceivablesInr: fulfillmentAudit.outstandingReceivablesInr
    },
    documentAudit
  }
}