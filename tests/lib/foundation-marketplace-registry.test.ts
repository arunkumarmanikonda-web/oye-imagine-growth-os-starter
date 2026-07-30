import { describe, expect, it } from 'vitest'
import { getAiMarketplaceOfferCatalog, getAiMarketplacePromptPresets, getAiMarketplaceRegistrySummary, getAiMarketplaceWorkspaceCards } from '../../src/lib/ai/marketplace-registry'

describe('marketplace-registry', () => {
  it('returns a marketplace offer catalog and prompt presets', () => {
    const offers = getAiMarketplaceOfferCatalog()
    const presets = getAiMarketplacePromptPresets('neejee')

    expect(offers).toHaveLength(6)
    expect(offers.some((offer) => offer.id === 'offer-reporting-command-center')).toBe(true)
    expect(presets).toHaveLength(5)
    expect(presets.some((preset) => preset.intent === 'renewal_expansion')).toBe(true)
  })

  it('returns workspace cards and registry summary', () => {
    const cards = getAiMarketplaceWorkspaceCards('2026-08-05T00:00:00.000Z')
    const summary = getAiMarketplaceRegistrySummary()

    expect(cards).toHaveLength(3)
    expect(cards.some((card) => card.workspaceKey === 'rocketboys')).toBe(true)
    expect(summary.workspaces).toBe(3)
    expect(summary.offers).toBe(6)
    expect(summary.promptPresets).toBe(5)
    expect(summary.intents).toBe(7)
  })
})