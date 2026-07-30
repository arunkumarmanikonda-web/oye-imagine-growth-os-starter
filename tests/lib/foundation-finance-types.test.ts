import { describe, expect, it } from 'vitest'
import { FINANCE_ALERT_SEVERITIES, FINANCE_TIMELINE_KINDS } from '../../src/lib/finance/finance-types'

describe('finance-types', () => {
  it('exposes supported finance timeline kinds', () => {
    expect(FINANCE_TIMELINE_KINDS).toEqual([
      'agreement_issued',
      'agreement_signed',
      'invoice_issued',
      'invoice_due',
      'payment_received',
    ])
  })

  it('exposes supported collection alert severities', () => {
    expect(FINANCE_ALERT_SEVERITIES).toEqual(['info', 'warning', 'critical'])
  })
})