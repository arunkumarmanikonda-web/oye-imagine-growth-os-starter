import { describe, expect, it } from 'vitest'
import {
  buildAgreementSignupBlueprint,
  getAgreementSignupSnapshot,
  getCanonicalProviderProfile,
} from '@/lib/recovery/commercial-agreement-foundation'

describe('foundation-commercial-agreement-legal-binding', () => {
  it('binds the canonical provider legal profile into every agreement blueprint', () => {
    const provider = getCanonicalProviderProfile()
    const blueprint = buildAgreementSignupBlueprint({
      clientLegalName: 'Prospective client',
      requestedLanes: ['growth_strategy'],
    })

    expect(provider.gstin).toBe('09AAECO6856D1Z8')
    expect(blueprint.providerProfile.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(blueprint.legalBinding.canonicalProviderBound).toBe(true)
    expect(blueprint.legalBinding.immutableProviderFields).toContain('gstin')
  })

  it('exposes a stable commercial foundation snapshot', () => {
    const snapshot = getAgreementSignupSnapshot()

    expect(snapshot.availableScopeLaneCount).toBeGreaterThan(0)
    expect(snapshot.annexTemplateCount).toBeGreaterThan(0)
    expect(snapshot.intakeChecklistCount).toBeGreaterThan(0)
  })
})