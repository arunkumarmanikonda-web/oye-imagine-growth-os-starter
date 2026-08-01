import { describe, expect, it } from 'vitest'
import { buildAgreementSignupBlueprint } from '@/lib/recovery/commercial-agreement-foundation'

describe('foundation-commercial-agreement-signup', () => {
  it('builds a signup blueprint with client details, annexures and commercial structure', () => {
    const blueprint = buildAgreementSignupBlueprint({
      clientLegalName: 'Neejee Retail Private Limited',
      clientTradeName: 'Neejee',
      clientPrimaryContactName: 'Commercial Lead',
      clientPrimaryContactEmail: 'finance@neejee.example',
      requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
      billingModel: 'monthly_retainer',
      baseFeeInr: 125000,
      paymentTerm: 'net_15',
    })

    expect(blueprint.status).toBe('intake_ready')
    expect(blueprint.scopeAnnexes.length).toBe(3)
    expect(blueprint.commercialTerms.gstRatePercent).toBe(18)
    expect(blueprint.approvalChain.length).toBe(4)
  })
})