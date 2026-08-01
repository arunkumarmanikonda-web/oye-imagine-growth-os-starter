import { describe, expect, it } from 'vitest'
import {
  getCommercialConciergeCrosswalk,
  getIntegrationValidationGate,
} from '@/lib/recovery/recovery-integration-manifest'

describe('foundation-recovery-integration-commercial-concierge', () => {
  it('builds the client, operator and marketplace commercial-concierge crosswalk', () => {
    const crosswalk = getCommercialConciergeCrosswalk()

    expect(crosswalk.length).toBe(3)
    expect(crosswalk.find((item) => item.audience === 'client')?.conciergeRoute).toBe('/client/concierge')
    expect(crosswalk.find((item) => item.audience === 'operator')?.commercialRoute).toBe('/admin/commercial/dashboard')
    expect(crosswalk.find((item) => item.audience === 'marketplace')?.conciergeRoute).toBe('/marketplace/ai')
  })

  it('keeps the integration validation gate ready with no missing routes', () => {
    const gate = getIntegrationValidationGate()

    expect(gate.status).toBe('ready')
    expect(gate.missingRequiredRoutes.length).toBe(0)
    expect(gate.crosswalkCount).toBe(3)
  })
})