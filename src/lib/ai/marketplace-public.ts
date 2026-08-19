import { getAiMarketplaceOfferCatalog, getAiMarketplacePromptPresets } from './marketplace-registry'
import type { AiMarketplaceIntent } from './marketplace-types'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function inferPublicMarketplaceIntent(message: string): AiMarketplaceIntent {
  const normalized = normalize(message)

  if (normalized.includes('invoice') || normalized.includes('billing') || normalized.includes('gst')) {
    return 'billing_optimization'
  }
  if (normalized.includes('launch') || normalized.includes('campaign') || normalized.includes('go live')) {
    return 'launch_acceleration'
  }
  if (normalized.includes('seo') || normalized.includes('search') || normalized.includes('visibility')) {
    return 'seo_visibility'
  }
  if (normalized.includes('report') || normalized.includes('dashboard') || normalized.includes('analytics')) {
    return 'reporting_visibility'
  }
  if (normalized.includes('renewal') || normalized.includes('expand') || normalized.includes('retention')) {
    return 'renewal_expansion'
  }
  if (normalized.includes('growth') || normalized.includes('execution') || normalized.includes('retainer') || normalized.includes('scale')) {
    return 'growth_execution'
  }
  return 'general_discovery'
}

export function buildPublicMarketplaceResponse(message: string) {
  const intent = inferPublicMarketplaceIntent(message)
  const catalog = getAiMarketplaceOfferCatalog()
  const matching = catalog.filter((offer) => offer.intents.includes(intent))
  const ranked = (matching.length ? matching : catalog).slice(0, 3)

  return {
    scope: 'public_catalog' as const,
    intent,
    headline: 'Marketplace recommendations',
    summary: 'Recommendations are based only on the published Oye !magine service catalog. Sign in for workspace-specific evidence and commercial state.',
    recommendedOffers: ranked.map((offer) => ({
      id: offer.id,
      slug: offer.slug,
      title: offer.title,
      category: offer.category,
      summary: offer.summary,
      priceFrom: offer.priceFrom,
      bestFor: offer.bestFor,
    })),
    suggestedPrompts: getAiMarketplacePromptPresets('public').map(({ title, prompt, intent: presetIntent }) => ({
      title,
      prompt,
      intent: presetIntent,
    })),
  }
}
