import { describe, expect, it } from 'vitest'
import {
  architectureDecisionRecords,
  buildVsBuyDecisions,
  complianceMatrix,
  competitorMatrix,
  getControlsByDomain,
  getCriticalRisks,
  isArchitectureBaselineClosureReady,
  riskRegister,
  securityPrivacyControlInventory,
} from '../../src/lib/security/h1-architecture-security-baseline'

describe('h1 architecture and security baseline', () => {
  it('declares the expected architecture closure artifacts', () => {
    expect(competitorMatrix.length).toBeGreaterThanOrEqual(3)
    expect(complianceMatrix.length).toBeGreaterThanOrEqual(3)
    expect(buildVsBuyDecisions.length).toBeGreaterThanOrEqual(3)
    expect(architectureDecisionRecords.length).toBeGreaterThanOrEqual(4)
  })

  it('ensures all risks map to named controls', () => {
    const controlIds = new Set(securityPrivacyControlInventory.map((control) => control.id))
    for (const risk of riskRegister) {
      expect(risk.linkedControlIds.length).toBeGreaterThan(0)
      for (const controlId of risk.linkedControlIds) {
        expect(controlIds.has(controlId)).toBe(true)
      }
    }
  })

  it('keeps at least one critical risk visible for governance review', () => {
    const critical = getCriticalRisks()
    expect(critical.length).toBeGreaterThan(0)
  })

  it('contains explicit tenant isolation controls', () => {
    const tenantControls = getControlsByDomain('tenant-isolation')
    expect(tenantControls.length).toBeGreaterThan(0)
  })

  it('meets closure-ready baseline completeness', () => {
    expect(isArchitectureBaselineClosureReady()).toBe(true)
  })
})
