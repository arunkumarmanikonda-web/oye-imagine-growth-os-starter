import { describe, expect, it } from 'vitest'
import { buildAgreementExecutionPackage } from '@/lib/recovery/commercial-agreement-execution'

describe('foundation-commercial-agreement-execution-package', () => {
  it('builds a governed agreement execution package with prepared artifacts', () => {
    const pkg = buildAgreementExecutionPackage({
      clientLegalName: 'Neejee Retail Private Limited',
      requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
      billingModel: 'monthly_retainer',
      baseFeeInr: 125000,
      paymentTerm: 'net_15',
    })

    expect(pkg.executionState).toBe('approval_in_progress')
    expect(pkg.artifacts.length).toBe(4)
    expect(pkg.signatureReadiness.providerBound).toBe(true)
    expect(pkg.actionShortcuts.length).toBe(3)
  })
})