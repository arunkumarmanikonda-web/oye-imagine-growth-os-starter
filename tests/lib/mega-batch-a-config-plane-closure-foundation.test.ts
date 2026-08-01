import { describe, expect, it } from 'vitest'
import {
  buildConfigPlaneState,
  canMutateConfigEntry,
  getConfigEntriesForAudience,
  getConfigPlaneAudit,
  getConfigPlaneRegistry
} from '../../src/lib/recovery/config-plane-closure-foundation'

describe('mega batch a config plane closure foundation', () => {
  it('publishes a canonical config plane registry', () => {
    const registry = getConfigPlaneRegistry()

    expect(registry).toHaveLength(4)
    expect(registry.map((entry) => entry.key)).toEqual([
      'brand.display_name',
      'workspace.default_key',
      'support.primary_email',
      'governance.approval_mode'
    ])
  })

  it('returns audience-specific config entries', () => {
    const clientEntries = getConfigEntriesForAudience('client')

    expect(clientEntries.map((entry) => entry.key)).toEqual([
      'workspace.default_key',
      'support.primary_email'
    ])
  })

  it('enforces config mutation by operator role', () => {
    const registry = getConfigPlaneRegistry()
    const governanceEntry = registry.find((entry) => entry.key === 'governance.approval_mode')
    const supportEntry = registry.find((entry) => entry.key === 'support.primary_email')

    expect(governanceEntry).toBeDefined()
    expect(supportEntry).toBeDefined()
    expect(canMutateConfigEntry('super_admin', governanceEntry!)).toBe(true)
    expect(canMutateConfigEntry('content_manager', governanceEntry!)).toBe(false)
    expect(canMutateConfigEntry('support_operator', supportEntry!)).toBe(true)
  })

  it('builds a super admin config plane state with full mutation coverage', () => {
    const state = buildConfigPlaneState('super_admin')

    expect(state.summary).toEqual({
      entryCount: 4,
      reviewRequiredCount: 3,
      overrideCount: 1
    })
  })

  it('builds restricted config plane states for content and support roles', () => {
    const contentState = buildConfigPlaneState('content_manager')
    const supportState = buildConfigPlaneState('support_operator')

    expect(contentState.accessibleEntries.map((entry) => entry.key)).toEqual([
      'brand.display_name'
    ])
    expect(supportState.accessibleEntries.map((entry) => entry.key)).toEqual([
      'support.primary_email'
    ])
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getConfigPlaneAudit()

    expect(audit.states.super_admin.summary.entryCount).toBe(4)
    expect(audit.proofScope).toEqual({
      functional: 'scope-aware config plane contract available',
      visible: 'pending actual config ui adoption',
      data: 'canonical config entries and override sources fixed',
      governance: 'mutation and review rules available'
    })
  })
})