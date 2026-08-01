import {
  getClientRemittanceExperience,
  getCommercialControlsAudit,
  getCommercialControlsExperience
} from './commercial-controls-foundation'
import { getMegaBatchBClosureAudit } from './mega-batch-b-closure-audit'

export function getMegaBatchBSecondTrancheClosureAudit() {
  const priorClosure = getMegaBatchBClosureAudit()
  const controls = getCommercialControlsExperience()
  const controlsAudit = getCommercialControlsAudit()
  const clientRemittance = getClientRemittanceExperience('Neejee')

  return {
    legalIdentity: priorClosure.legalIdentity,
    priorClosure: {
      agreementCount: priorClosure.foundation.agreementCount,
      invoiceCount: priorClosure.foundation.invoiceCount,
      ledgerEntryCount: priorClosure.foundation.ledgerEntryCount,
      outstandingReceivablesInr: priorClosure.foundation.outstandingReceivablesInr,
      resendEligibleCount: priorClosure.fulfillment.resendEligibleCount,
      paymentFollowUpEligibleCount: priorClosure.fulfillment.paymentFollowUpEligibleCount
    },
    controls: {
      totalHolds: controls.counts.totalHolds,
      activeHolds: controls.counts.activeHolds,
      releasedHolds: controls.counts.releasedHolds,
      remittanceSubmissions: controls.counts.remittanceSubmissions,
      pendingRemittanceValidations: controls.counts.pendingRemittanceValidations,
      supportEmail: controls.supportIdentity.email,
      supportPhone: controls.supportIdentity.phone
    },
    clientRemittance: {
      accountName: clientRemittance.accountName,
      summaryValues: clientRemittance.summaryCards.map((card) => card.value),
      actionPaths: clientRemittance.actions.map((action) => action.href),
      submissionCount: clientRemittance.submissions.length
    },
    governance: {
      receivableTruthAligned:
        controlsAudit.outstandingReceivablesInr === priorClosure.foundation.outstandingReceivablesInr,
      supportIdentityAligned:
        controlsAudit.supportEmail === priorClosure.operatorCommercial.supportIdentity.email &&
        controlsAudit.supportPhone === priorClosure.operatorCommercial.supportIdentity.phone,
      activeCommercialBlockPresent:
        controls.holds.some((hold) => hold.accountName === 'Neejee' && hold.status === 'active'),
      remittancePendingForBlockedAccount:
        controls.remittances.some(
          (remittance) => remittance.accountName === 'Neejee' && remittance.status === 'submitted'
        )
    }
  }
}