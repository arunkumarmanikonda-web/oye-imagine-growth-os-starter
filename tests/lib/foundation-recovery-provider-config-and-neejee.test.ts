import { describe, expect, it } from 'vitest'
import {
  getConfigCommandCenterCards,
  getProviderConfigProfiles,
  getProviderConfigSummary,
} from '@/lib/recovery/provider-config'
import { getNeejeeCanonicalProfile, getNeejeeTruthSignals } from '@/lib/recovery/neejee-canonical'

describe('foundation-recovery-provider-config-and-neejee', () => {
  it('builds the provider config spine with masked secret-backed profiles', () => {
    const profiles = getProviderConfigProfiles()
    const summary = getProviderConfigSummary()
    const cards = getConfigCommandCenterCards()

    expect(profiles.length).toBeGreaterThan(0)
    expect(summary.connectedCount).toBeGreaterThan(0)
    expect(summary.maskedSecretsCount).toBeGreaterThan(0)
    expect(cards.some((card) => card.label === 'Legal identity')).toBe(true)
  })

  it('seeds Neejee canonical truth without the wrong healthcare fixture', () => {
    const neejee = getNeejeeCanonicalProfile()
    const signals = getNeejeeTruthSignals()

    expect(neejee.tenantId).toBe('tenant_neejee')
    expect(neejee.workspaceId).toBe('workspace_neejee_primary')
    expect(neejee.industry).not.toBe('Healthcare')
    expect(signals.length).toBeGreaterThan(0)
  })
})