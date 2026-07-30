import { describe, expect, it } from 'vitest'
import {
  RECOVERY_BRANCH_HEADS,
  getIntegrationValidationGate,
  getRecoveryIntegrationSnapshot,
} from '@/lib/recovery/recovery-integration-manifest'

describe('foundation-recovery-integration-manifest', () => {
  it('pins the recovered branch heads and reports a ready validation gate', () => {
    const snapshot = getRecoveryIntegrationSnapshot()
    const gate = getIntegrationValidationGate()

    expect(RECOVERY_BRANCH_HEADS.megaBatchA).toBe('9603cce')
    expect(RECOVERY_BRANCH_HEADS.megaBatchB).toBe('f21b08e')
    expect(RECOVERY_BRANCH_HEADS.megaBatchC).toBe('5dd08d0')
    expect(snapshot.routeGroupCount).toBe(5)
    expect(gate.status).toBe('ready')
  })

  it('keeps duplicate route count at zero', () => {
    const snapshot = getRecoveryIntegrationSnapshot()
    expect(snapshot.duplicateRouteCount).toBe(0)
    expect(snapshot.uniqueRouteCount).toBe(snapshot.totalRouteCount)
  })
})