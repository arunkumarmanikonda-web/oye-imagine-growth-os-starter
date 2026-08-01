import { describe, expect, it } from 'vitest'
import { getCommercialFoundationSnapshot } from '../../src/lib/recovery/commercial-foundation'

describe('mega batch b commercial foundation', () => {
  it('exposes canonical commercial identity', () => {
    const snapshot = getCommercialFoundationSnapshot()
    expect(snapshot.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(snapshot.gstin).toBe('09AAECO6856D1Z8')
  })

  it('tracks agreement, invoice and ledger counts', () => {
    const snapshot = getCommercialFoundationSnapshot()
    expect(snapshot.agreementCount).toBe(2)
    expect(snapshot.invoiceCount).toBe(2)
    expect(snapshot.ledgerEntryCount).toBe(2)
  })

  it('computes outstanding receivables', () => {
    const snapshot = getCommercialFoundationSnapshot()
    expect(snapshot.outstandingReceivablesInr).toBe(68000)
  })
})