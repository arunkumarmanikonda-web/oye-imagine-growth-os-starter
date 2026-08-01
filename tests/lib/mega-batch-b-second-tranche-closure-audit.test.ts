import { describe, expect, it } from 'vitest'

import { getMegaBatchBSecondTrancheClosureAudit } from '../../src/lib/recovery/mega-batch-b-second-tranche-closure-audit'

describe('mega batch b second tranche closure audit', () => {
  it('preserves canonical legal identity', () => {
    const audit = getMegaBatchBSecondTrancheClosureAudit()

    expect(audit.legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(audit.legalIdentity.cin).toBe('U47190UP2025PTC220916')
    expect(audit.legalIdentity.pan).toBe('AAECO6856D')
    expect(audit.legalIdentity.tan).toBe('MRTO02898A')
  })

  it('keeps prior commercial closure counts intact', () => {
    const audit = getMegaBatchBSecondTrancheClosureAudit()

    expect(audit.priorClosure.agreementCount).toBe(2)
    expect(audit.priorClosure.invoiceCount).toBe(2)
    expect(audit.priorClosure.ledgerEntryCount).toBe(2)
    expect(audit.priorClosure.outstandingReceivablesInr).toBe(68000)
    expect(audit.priorClosure.resendEligibleCount).toBe(1)
    expect(audit.priorClosure.paymentFollowUpEligibleCount).toBe(1)
  })

  it('captures controls and remittance governance counts', () => {
    const audit = getMegaBatchBSecondTrancheClosureAudit()

    expect(audit.controls.totalHolds).toBe(2)
    expect(audit.controls.activeHolds).toBe(1)
    expect(audit.controls.releasedHolds).toBe(1)
    expect(audit.controls.remittanceSubmissions).toBe(1)
    expect(audit.controls.pendingRemittanceValidations).toBe(1)
    expect(audit.controls.supportEmail).toBe('hello@oyeimagine.com')
    expect(audit.controls.supportPhone).toBe('+91 8 988 988 988')
  })

  it('captures the Neejee client remittance surface contract', () => {
    const audit = getMegaBatchBSecondTrancheClosureAudit()

    expect(audit.clientRemittance.accountName).toBe('Neejee')
    expect(audit.clientRemittance.summaryValues).toEqual(['₹68,000', '1', '0', '0'])
    expect(audit.clientRemittance.actionPaths).toEqual([
      '/client/commercial/remittance',
      '/client/commercial/payments',
      '/contact'
    ])
    expect(audit.clientRemittance.submissionCount).toBe(1)
  })

  it('proves controls stay aligned to receivable and support truth', () => {
    const audit = getMegaBatchBSecondTrancheClosureAudit()

    expect(audit.governance.receivableTruthAligned).toBe(true)
    expect(audit.governance.supportIdentityAligned).toBe(true)
    expect(audit.governance.activeCommercialBlockPresent).toBe(true)
    expect(audit.governance.remittancePendingForBlockedAccount).toBe(true)
  })
})