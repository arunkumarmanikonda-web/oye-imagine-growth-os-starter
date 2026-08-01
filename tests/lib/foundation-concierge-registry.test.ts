import { describe, expect, it } from 'vitest'
import { getAiConciergePromptPresets, getAiConciergeRegistrySummary, getAiConciergeWorkspaceCards } from '../../src/lib/ai/concierge-registry'

describe('concierge-registry', () => {
  it('returns prompt presets for a workspace', () => {
    const presets = getAiConciergePromptPresets('neejee')

    expect(presets).toHaveLength(5)
    expect(presets[0].intent).toBe('billing_overview')
    expect(presets.some((preset) => preset.intent === 'support_handoff')).toBe(true)
  })

  it('returns workspace cards and registry summary', () => {
    const cards = getAiConciergeWorkspaceCards('2026-08-05T00:00:00.000Z')
    const summary = getAiConciergeRegistrySummary()

    expect(cards).toHaveLength(3)
    expect(cards.some((card) => card.workspaceKey === 'neejee')).toBe(true)
    expect(summary.workspaces).toBe(3)
    expect(summary.promptPresets).toBe(5)
    expect(summary.intents).toBe(6)
  })
})