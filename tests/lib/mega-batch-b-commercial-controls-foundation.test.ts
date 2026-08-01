import { describe, expect, it } from 'vitest'

import {
  getClientRemittanceExperience,
  getCommercialControlsAudit,
  getCommercialControlsExperience
} from '../../src/lib/recovery/commercial-controls-foundation'

describe('mega batch b commercial controls foundation', () => {
  it('builds hold and remittance governance counts', () => {
    const experience = getCommercialControlsExperience()

    expect(experience.issuer.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.counts.totalHolds).toBe(2)
    expect(experience.counts.activeHolds).toBe(1)
    expect(experience.counts.releasedHolds).toBe(1)
    expect(experience.counts.remittanceSubmissions).toBe(1)
    expect(experience.counts.pendingRemittanceValidations).toBe(1)
  })

  it('keeps Neejee under an active service-activation hold with remittance pending', () => {
    const experience = getCommercialControlsExperience()
    const hold = experience.holds.find((entry) => entry.accountName === 'Neejee')
    const remittance = experience.remittances.find((entry) => entry.accountName === 'Neejee')

    expect(hold?.status).toBe('active')
    expect(hold?.blockedArea).toBe('service_activation')
    expect(hold?.outstandingAmountInr).toBe(68000)

    expect(remittance?.status).toBe('submitted')
    expect(remittance?.amountInr).toBe(68000)
  })

  it('builds the Neejee remittance validation dashboard', () => {
    const experience = getClientRemittanceExperience('Neejee')

    expect(experience.accountName).toBe('Neejee')
    expect(experience.summaryCards[0].value).toBe('₹68,000')
    expect(experience.summaryCards[1].value).toBe('1')
    expect(experience.summaryCards[2].value).toBe('0')
    expect(experience.summaryCards[3].value).toBe('0')
    expect(experience.submissions).toHaveLength(1)
  })

  it('returns an empty but valid remittance dashboard for unknown accounts', () => {
    const experience = getClientRemittanceExperience('Unknown Account')

    expect(experience.summaryCards[0].value).toBe('₹0')
    expect(experience.submissions).toHaveLength(0)
  })

  it('produces a controls audit tied to canonical support identity and receivable truth', () => {
    const audit = getCommercialControlsAudit()

    expect(audit.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.gstin).toBe('09AAECO6856D1Z8')
    expect(audit.activeHolds).toBe(1)
    expect(audit.releasedHolds).toBe(1)
    expect(audit.pendingRemittanceValidations).toBe(1)
    expect(audit.outstandingReceivablesInr).toBe(68000)
    expect(audit.supportEmail).toBe('hello@oyeimagine.com')
    expect(audit.supportPhone).toBe('+91 8 988 988 988')
  })
})