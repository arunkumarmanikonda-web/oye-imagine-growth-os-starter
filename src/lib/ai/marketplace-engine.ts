import { buildCommercialAutomationJobs } from '../commercial/commercial-automation'
import { getClientFinanceWorkspace } from '../finance/client-finance'
import { getAiMarketplaceOfferCatalog } from './marketplace-registry'
import type {
  AiMarketplaceAction,
  AiMarketplaceContextSummary,
  AiMarketplaceInsight,
  AiMarketplaceIntent,
  AiMarketplaceOffer,
  AiMarketplaceRecommendation,
  AiMarketplaceRequest,
  AiMarketplaceResponse,
} from './marketplace-types'

function normalizeWorkspaceKey(workspaceKey: string): string {
  return workspaceKey.trim().toLowerCase()
}

function normalizeMessage(message: string): string {
  return message.trim().toLowerCase()
}

export function inferAiMarketplaceIntent(message: string): AiMarketplaceIntent {
  const normalized = normalizeMessage(message)

  if (
    normalized.includes('invoice') ||
    normalized.includes('billing') ||
    normalized.includes('gst') ||
    normalized.includes('outstanding') ||
    normalized.includes('collections')
  ) {
    return 'billing_optimization'
  }

  if (
    normalized.includes('launch') ||
    normalized.includes('campaign') ||
    normalized.includes('go live') ||
    normalized.includes('go-live')
  ) {
    return 'launch_acceleration'
  }

  if (
    normalized.includes('seo') ||
    normalized.includes('search') ||
    normalized.includes('visibility')
  ) {
    return 'seo_visibility'
  }

  if (
    normalized.includes('report') ||
    normalized.includes('dashboard') ||
    normalized.includes('analytics') ||
    normalized.includes('reporting')
  ) {
    return 'reporting_visibility'
  }

  if (
    normalized.includes('renewal') ||
    normalized.includes('expand') ||
    normalized.includes('upsell') ||
    normalized.includes('retention')
  ) {
    return 'renewal_expansion'
  }

  if (
    normalized.includes('growth') ||
    normalized.includes('execution') ||
    normalized.includes('retainer') ||
    normalized.includes('scale')
  ) {
    return 'growth_execution'
  }

  return 'general_discovery'
}

function buildContextSummary(workspaceKey: string, referenceDate: string): AiMarketplaceContextSummary {
  const financeWorkspace = getClientFinanceWorkspace(workspaceKey, referenceDate)
  const jobs = buildCommercialAutomationJobs(workspaceKey, referenceDate)

  return {
    workspaceKey: financeWorkspace.summary.workspaceKey,
    clientName: financeWorkspace.summary.clientName,
    invoiceCount: financeWorkspace.summary.invoiceCount,
    agreementCount: financeWorkspace.summary.agreementCount,
    totalInvoiced: financeWorkspace.summary.totalInvoiced,
    outstandingAmount: financeWorkspace.summary.outstandingAmount,
    openCollectionCount: financeWorkspace.summary.collectionOpenCount,
    paidInvoiceCount: financeWorkspace.summary.paidInvoiceCount,
    automationJobCount: jobs.length,
  }
}

function scoreOffer(
  offer: AiMarketplaceOffer,
  intent: AiMarketplaceIntent,
  surface: AiMarketplaceRequest['surface'],
  context: AiMarketplaceContextSummary,
): number {
  let score = 0

  if (offer.surfaces.includes(surface)) {
    score += 10
  }

  if (offer.intents.includes(intent)) {
    score += 50
  }

  if (context.outstandingAmount > 0 && offer.id === 'offer-collections-stability-sprint') {
    score += 25
  }

  if (context.openCollectionCount > 0 && offer.id === 'offer-reporting-command-center') {
    score += 12
  }

  if (context.agreementCount > 1 && offer.id === 'offer-growth-os-retainer') {
    score += 10
  }

  if (context.paidInvoiceCount > 0 && offer.id === 'offer-renewal-expansion-pack') {
    score += 25
  }

  if (intent === 'general_discovery' && offer.id === 'offer-growth-os-retainer') {
    score += 15
  }

  if (intent === 'reporting_visibility' && offer.id === 'offer-reporting-command-center') {
    score += 20
  }

  if (intent === 'billing_optimization' && offer.id === 'offer-collections-stability-sprint') {
    score += 20
  }

  if (intent === 'renewal_expansion' && offer.id === 'offer-renewal-expansion-pack') {
    score += 20
  }

  return score
}

function explainRecommendation(
  offer: AiMarketplaceOffer,
  intent: AiMarketplaceIntent,
  context: AiMarketplaceContextSummary,
): string {
  if (offer.id === 'offer-collections-stability-sprint') {
    return `Recommended because ${context.clientName} has INR ${context.outstandingAmount} outstanding and active collection follow-up pressure.`
  }

  if (offer.id === 'offer-reporting-command-center') {
    return `Recommended to improve finance visibility across ${context.invoiceCount} invoice(s) and ${context.automationJobCount} automation job(s).`
  }

  if (offer.id === 'offer-renewal-expansion-pack') {
    return `Recommended because paid delivery and continuity signals support expansion planning.`
  }

  if (offer.id === 'offer-growth-os-retainer') {
    return `Recommended for sustained execution across ${context.agreementCount} agreement(s) and ongoing operational continuity.`
  }

  if (offer.id === 'offer-launch-acceleration-sprint') {
    return `Recommended for faster conversion setup and launch execution.`
  }

  if (offer.id === 'offer-seo-recovery-sprint') {
    return `Recommended for search visibility improvement and structured recovery work.`
  }

  return `Recommended for ${intent.replaceAll('_', ' ')} based on current workspace context.`
}

function buildRecommendations(
  intent: AiMarketplaceIntent,
  request: AiMarketplaceRequest,
  context: AiMarketplaceContextSummary,
): AiMarketplaceRecommendation[] {
  return getAiMarketplaceOfferCatalog()
    .map((offer) => {
      const score = scoreOffer(offer, intent, request.surface, context)

      return {
        id: `${request.workspaceKey}-${offer.id}`,
        offerId: offer.id,
        title: offer.title,
        category: offer.category,
        summary: offer.summary,
        priceFrom: offer.priceFrom,
        score,
        reason: explainRecommendation(offer, intent, context),
      } satisfies AiMarketplaceRecommendation
    })
    .sort((left, right) => {
      if (left.score === right.score) {
        return left.title > right.title ? 1 : -1
      }

      return right.score - left.score
    })
    .slice(0, 3)
}

function buildInsights(
  intent: AiMarketplaceIntent,
  context: AiMarketplaceContextSummary,
): AiMarketplaceInsight[] {
  const insights: AiMarketplaceInsight[] = [
    {
      id: 'marketplace-context',
      title: 'Workspace context',
      detail: `${context.clientName} has ${context.agreementCount} agreement(s), ${context.invoiceCount} invoice(s), and ${context.automationJobCount} commercial automation job(s).`,
      tone: 'neutral',
    },
  ]

  if (context.outstandingAmount > 0) {
    insights.push({
      id: 'marketplace-outstanding',
      title: 'Outstanding commercial pressure',
      detail: `Outstanding value is INR ${context.outstandingAmount} with ${context.openCollectionCount} open collection lane(s).`,
      tone: 'attention',
    })
  } else {
    insights.push({
      id: 'marketplace-clear',
      title: 'Healthy commercial base',
      detail: `No open outstanding balance blocks the next recommendation set.`,
      tone: 'positive',
    })
  }

  if (intent === 'renewal_expansion' && context.paidInvoiceCount > 0) {
    insights.push({
      id: 'marketplace-renewal',
      title: 'Renewal expansion signal',
      detail: `${context.paidInvoiceCount} paid invoice(s) support continuity and expansion conversations.`,
      tone: 'positive',
    })
  }

  return insights
}

function buildActions(
  intent: AiMarketplaceIntent,
  workspaceKey: string,
): AiMarketplaceAction[] {
  const encodedWorkspace = encodeURIComponent(workspaceKey)

  switch (intent) {
    case 'billing_optimization':
      return [
        {
          id: 'open-client-finance',
          label: 'Open client finance',
          href: '/client/finance',
          reason: 'Validate outstanding billing, GST mode, and linked agreements.',
        },
        {
          id: 'open-marketplace-api',
          label: 'Open marketplace AI API',
          href: `/api/marketplace/ai?workspaceKey=${encodedWorkspace}&message=Show%20the%20best%20marketplace%20offers%20for%20outstanding%20invoices`,
          reason: 'Inspect the machine-readable recommendation payload.',
        },
      ]
    case 'renewal_expansion':
      return [
        {
          id: 'open-admin-agreements',
          label: 'Open admin agreements',
          href: '/admin/agreements',
          reason: 'Validate signed agreements and renewal timing before expansion.',
        },
        {
          id: 'open-marketplace-ai',
          label: 'Open marketplace AI',
          href: '/marketplace/ai',
          reason: 'Review recommended renewal expansion offers.',
        },
      ]
    default:
      return [
        {
          id: 'open-marketplace-ai',
          label: 'Open marketplace AI',
          href: '/marketplace/ai',
          reason: 'Review the ranked offer recommendations for this workspace.',
        },
        {
          id: 'open-admin-commercial',
          label: 'Open admin commercial',
          href: '/admin/commercial',
          reason: 'Cross-check commercial automation and readiness before action.',
        },
      ]
  }
}

function buildSuggestedPrompts(intent: AiMarketplaceIntent): string[] {
  switch (intent) {
    case 'billing_optimization':
      return [
        'Show offers for outstanding invoices and GST reporting',
        'Which package helps collections and billing clarity',
        'Recommend a finance visibility offer',
      ]
    case 'growth_execution':
      return [
        'Recommend the best retainer for ongoing growth execution',
        'Which marketplace offer supports scale',
        'Show top growth system packages',
      ]
    case 'launch_acceleration':
      return [
        'What is the best offer for a new launch',
        'Recommend a launch sprint',
        'Show launch acceleration packages',
      ]
    case 'seo_visibility':
      return [
        'Recommend an SEO recovery package',
        'Show offers for search visibility',
        'Which sprint improves SEO fastest',
      ]
    case 'reporting_visibility':
      return [
        'Show reporting and dashboard offers',
        'Recommend visibility packages for leadership',
        'Which offer improves commercial reporting',
      ]
    case 'renewal_expansion':
      return [
        'Show offers for renewal and upsell',
        'Recommend the best post-renewal package',
        'Which offer supports expansion planning',
      ]
    default:
      return [
        'Show the best marketplace offers for this workspace',
        'What should we buy next',
        'Recommend the top 3 offers for our current state',
      ]
  }
}

export function buildAiMarketplaceResponse(
  request: AiMarketplaceRequest,
): AiMarketplaceResponse {
  const referenceDate = request.referenceDate ?? '2026-08-05T00:00:00.000Z'
  const workspaceKey = normalizeWorkspaceKey(request.workspaceKey)
  const intent = inferAiMarketplaceIntent(request.message)
  const context = buildContextSummary(workspaceKey, referenceDate)

  return {
    workspaceKey,
    surface: request.surface,
    intent,
    headline: `${context.clientName} marketplace AI recommendations`,
    summary: `Top recommendations are ranked against ${context.invoiceCount} invoice(s), ${context.agreementCount} agreement(s), and current commercial pressure.`,
    context,
    insights: buildInsights(intent, context),
    recommendedOffers: buildRecommendations(intent, request, context),
    actions: buildActions(intent, workspaceKey),
    suggestedPrompts: buildSuggestedPrompts(intent),
  }
}