import { describe, expect, it } from 'vitest'
import {
  cleanupChecklist,
  configOperations,
  contentOperations,
  getOperatorControlPlaneExperience,
  operatorIdentity,
  supportOperations
} from '@/lib/recovery/operator-control-plane-foundation'

describe('mega batch a a4 operator content config support cleanup', () => {
  it('publishes operator identity and canonical workspace truth', () => {
    expect(operatorIdentity.operatorLabel).toContain('Operator Control Plane')
    expect(operatorIdentity.canonicalWorkspace).toBe('workspace_oye_internal')
    expect(operatorIdentity.supportEmail).toBe('hello@oyeimagine.com')
  })

  it('exposes governed content config and support surfaces', () => {
    expect(contentOperations.length).toBeGreaterThanOrEqual(2)
    expect(configOperations.length).toBeGreaterThanOrEqual(2)
    expect(supportOperations.length).toBeGreaterThanOrEqual(2)
    expect(contentOperations.every((entry) => entry.checkpoints.length >= 3)).toBe(true)
    expect(configOperations.every((entry) => entry.checkpoints.length >= 3)).toBe(true)
    expect(supportOperations.every((entry) => entry.checkpoints.length >= 3)).toBe(true)
  })

  it('keeps cleanup checklist in pass state', () => {
    const experience = getOperatorControlPlaneExperience()

    expect(cleanupChecklist.every((entry) => entry.result === 'PASS')).toBe(true)
    expect(experience.cleanupChecklist.length).toBe(3)
    expect(experience.operatorIdentity.governanceNote).toContain('governed')
  })
})