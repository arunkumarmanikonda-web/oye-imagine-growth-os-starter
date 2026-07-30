import { getCommercialWorkspaces } from '../commercial/commercial-hardening'
import { getClientFinanceWorkspace } from '../finance/client-finance'
import { AI_MARKETPLACE_INTENTS, type AiMarketplaceOffer, type AiMarketplacePromptPreset, type AiMarketplaceRegistrySummary, type AiMarketplaceWorkspaceCard } from './marketplace-types'

export const AI_MARKETPLACE_OFFER_CATALOG: AiMarketplaceOffer[] = [
  {
    id: 'offer-collections-stability-sprint',
    slug: 'collections-stability-sprint',
    title: 'Collections Stability Sprint',
    category: 'commercial_ops',
    summary: 'Tighten invoice follow-up, payment recovery, and commercial collections rhythm.',
    priceFrom: 18000,
    surfaces: ['client', 'admin'],
    intents: ['billing_optimization', 'reporting_visibility'],
    tags: ['collections', 'billing', 'recovery'],
    bestFor: ['open outstanding invoices', 'payment follow-up pressure', 'collections visibility'],
  },
  {
    id: 'offer-growth-os-retainer',
    slug: 'growth-os-retainer',
    title: 'Growth Operating System Retainer',
    category: 'growth_system',
    summary: 'Unified monthly execution layer for growth, reporting, and operational continuity.',
    priceFrom: 125000,
    surfaces: ['client', 'admin'],
    intents: ['growth_execution', 'general_discovery', 'renewal_expansion'],
    tags: ['retainer', 'growth', 'operating-system'],
    bestFor: ['multi-channel growth execution', 'ongoing operating cadence', 'cross-functional scaling'],
  },
  {
    id: 'offer-launch-acceleration-sprint',
    slug: 'launch-acceleration-sprint',
    title: 'Launch Acceleration Sprint',
    category: 'launch_support',
    summary: 'Fast-turn campaign, landing page, and conversion setup for new launches.',
    priceFrom: 75000,
    surfaces: ['client', 'admin'],
    intents: ['launch_acceleration', 'growth_execution'],
    tags: ['launch', 'campaign', 'conversion'],
    bestFor: ['new offer launches', 'go-live preparation', 'campaign acceleration'],
  },
  {
    id: 'offer-seo-recovery-sprint',
    slug: 'seo-recovery-sprint',
    title: 'SEO Recovery Sprint',
    category: 'seo_growth',
    summary: 'Recover visibility with technical cleanup, content opportunity mapping, and execution.',
    priceFrom: 45000,
    surfaces: ['client', 'admin'],
    intents: ['seo_visibility', 'growth_execution'],
    tags: ['seo', 'visibility', 'search'],
    bestFor: ['search visibility improvement', 'technical SEO cleanup', 'content opportunity recovery'],
  },
  {
    id: 'offer-reporting-command-center',
    slug: 'reporting-command-center',
    title: 'Reporting Command Center',
    category: 'reporting_analytics',
    summary: 'Operator-grade dashboards, finance visibility, and leadership reporting continuity.',
    priceFrom: 30000,
    surfaces: ['client', 'admin'],
    intents: ['reporting_visibility', 'billing_optimization', 'general_discovery'],
    tags: ['reporting', 'dashboard', 'visibility'],
    bestFor: ['finance reporting clarity', 'leadership dashboarding', 'commercial transparency'],
  },
  {
    id: 'offer-renewal-expansion-pack',
    slug: 'renewal-expansion-pack',
    title: 'Renewal Expansion Pack',
    category: 'retention_expansion',
    summary: 'Convert successful retained work into renewal, upsell, and continuity planning.',
    priceFrom: 60000,
    surfaces: ['client', 'admin'],
    intents: ['renewal_expansion', 'growth_execution'],
    tags: ['renewal', 'retention', 'expansion'],
    bestFor: ['signed clients nearing continuation', 'upsell planning', 'renewal packaging'],
  },
]

export function getAiMarketplaceOfferCatalog(): AiMarketplaceOffer[] {
  return AI_MARKETPLACE_OFFER_CATALOG
}

export function getAiMarketplacePromptPresets(workspaceKey = 'neejee'): AiMarketplacePromptPreset[] {
  return [
    {
      id: `${workspaceKey}-billing`,
      title: 'Billing optimization',
      prompt: 'Show the best marketplace offers for outstanding invoices and GST visibility',
      intent: 'billing_optimization',
    },
    {
      id: `${workspaceKey}-growth`,
      title: 'Growth execution',
      prompt: 'Recommend the strongest offer for ongoing growth execution',
      intent: 'growth_execution',
    },
    {
      id: `${workspaceKey}-launch`,
      title: 'Launch acceleration',
      prompt: 'Which marketplace package fits an upcoming launch',
      intent: 'launch_acceleration',
    },
    {
      id: `${workspaceKey}-reporting`,
      title: 'Reporting visibility',
      prompt: 'I need better reporting and commercial visibility',
      intent: 'reporting_visibility',
    },
    {
      id: `${workspaceKey}-renewal`,
      title: 'Renewal expansion',
      prompt: 'What is the best offer after a successful renewal cycle',
      intent: 'renewal_expansion',
    },
  ]
}

export function getAiMarketplaceWorkspaceCards(
  referenceDate = '2026-08-05T00:00:00.000Z',
): AiMarketplaceWorkspaceCard[] {
  return getCommercialWorkspaces().map((workspaceKey) => {
    const workspace = getClientFinanceWorkspace(workspaceKey, referenceDate)

    return {
      workspaceKey,
      clientName: workspace.summary.clientName,
      invoiceCount: workspace.summary.invoiceCount,
      agreementCount: workspace.summary.agreementCount,
      outstandingAmount: workspace.summary.outstandingAmount,
      openCollectionCount: workspace.summary.collectionOpenCount,
    }
  })
}

export function getAiMarketplaceRegistrySummary(): AiMarketplaceRegistrySummary {
  return {
    workspaces: getCommercialWorkspaces().length,
    offers: getAiMarketplaceOfferCatalog().length,
    promptPresets: getAiMarketplacePromptPresets().length,
    intents: AI_MARKETPLACE_INTENTS.length,
  }
}