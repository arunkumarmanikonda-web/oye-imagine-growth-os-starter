import { describe, expect, it } from 'vitest'
import { getCommercialHardeningSnapshot, getCommercialWorkspaces } from '../../src/lib/commercial/commercial-hardening'

describe('commercial-hardening', () => {
  it('builds a commercial hardening snapshot with passing controls', () => {
    const snapshot = getCommercialHardeningSnapshot('2026-08-05T00:00:00.000Z')

    expect(snapshot.totalAutomationJobs).toBe(4)
    expect(snapshot.criticalAutomationJobs).toBe(1)
    expect(snapshot.openCollectionsValue).toBe(183240)
    expect(snapshot.readinessScore).toBe(100)
    expect(snapshot.workspacesCovered).toEqual(['neejee', 'rocketboys', 'clevercare'])
    expect(snapshot.atRiskWorkspaces).toContain('rocketboys')
    expect(snapshot.checks.every((check) => check.passed)).toBe(true)
  })

  it('returns the commercial workspaces derived from billing data', () => {
    const workspaces = getCommercialWorkspaces()

    expect(workspaces).toEqual(['neejee', 'rocketboys', 'clevercare'])
  })
})