import { describe, expect, it } from 'vitest'
import {
  getContentGovernanceSnapshot,
  listEditableSurfaceTargets,
  listImmutableIdentityFields,
} from '@/lib/recovery/content-governance'

describe('foundation-recovery-content-governance', () => {
  it('exposes editable targets, immutable identity rules and governance counts', () => {
    const snapshot = getContentGovernanceSnapshot()
    const targets = listEditableSurfaceTargets()
    const immutableFields = listImmutableIdentityFields()

    expect(snapshot.editableTargetCount).toBe(targets.length)
    expect(snapshot.immutableFieldCount).toBe(immutableFields.length)
    expect(targets.some((target) => target.targetId === 'hero-main')).toBe(true)
    expect(immutableFields).toContain('gstin')
  })
})