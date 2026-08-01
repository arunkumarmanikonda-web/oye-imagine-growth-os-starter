import { describe, expect, it } from 'vitest'
import {
  buildAgreementExecutionPackage,
  getAdminCommercialExecutionExperience,
  getCommercialExecutionSnapshot,
} from '@/lib/recovery/commercial-agreement-execution'

describe('foundation-commercial-signature-prep', () => {
  it('keeps signature preparation bound to canonical provider identity', () => {
    const pkg = buildAgreementExecutionPackage({
      clientLegalName: 'Prospective client',
      requestedLanes: ['growth_strategy'],
      eSignProvider: 'pending_integration',
    })

    expect(pkg.providerProfile.gstin).toBe('09AAECO6856D1Z8')
    expect(pkg.signatureReadiness.immutableProviderFields).toContain('gstin')
    expect(pkg.signatureReadiness.readyDocumentCount).toBe(4)
  })

  it('exposes stable admin execution and snapshot metadata', () => {
    const snapshot = getCommercialExecutionSnapshot()
    const experience = getAdminCommercialExecutionExperience()

    expect(snapshot.artifactTypeCount).toBe(4)
    expect(snapshot.eSignProviderCount).toBeGreaterThan(0)
    expect(experience.workflowCards.length).toBe(3)
  })
})