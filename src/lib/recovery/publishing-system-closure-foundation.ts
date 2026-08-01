export type PublishSurface = 'public' | 'client' | 'operator'
export type PublishChannel = 'website' | 'client_portal' | 'operator_console'
export type PublishStatus = 'published' | 'ready' | 'blocked'

export type PublishItem = {
  key: string
  surface: PublishSurface
  channel: PublishChannel
  status: PublishStatus
  requiresApproval: boolean
  readinessChecks: string[]
  blockers: string[]
}

export type PublishPlan = {
  surface: PublishSurface
  items: PublishItem[]
  summary: {
    publishedCount: number
    readyCount: number
    blockedCount: number
  }
  unresolvedBlockers: string[]
}

const canonicalPublishRegistry: Record<PublishSurface, PublishItem[]> = {
  public: [
    {
      key: 'public-homepage',
      surface: 'public',
      channel: 'website',
      status: 'published',
      requiresApproval: true,
      readinessChecks: ['cms-bound', 'legal-trust-bound', 'seo-checked'],
      blockers: []
    },
    {
      key: 'public-proof-strip',
      surface: 'public',
      channel: 'website',
      status: 'blocked',
      requiresApproval: true,
      readinessChecks: ['cms-bound', 'legal-trust-bound', 'proof-assets-linked'],
      blockers: ['proof-assets-pending']
    }
  ],
  client: [
    {
      key: 'client-dashboard-welcome',
      surface: 'client',
      channel: 'client_portal',
      status: 'ready',
      requiresApproval: true,
      readinessChecks: ['workspace-bound', 'support-bound'],
      blockers: []
    },
    {
      key: 'client-support-panel',
      surface: 'client',
      channel: 'client_portal',
      status: 'blocked',
      requiresApproval: false,
      readinessChecks: ['workspace-bound', 'support-bound'],
      blockers: ['support-copy-approval-pending']
    }
  ],
  operator: [
    {
      key: 'operator-control-tower',
      surface: 'operator',
      channel: 'operator_console',
      status: 'ready',
      requiresApproval: true,
      readinessChecks: ['governance-bound', 'trust-bound'],
      blockers: []
    },
    {
      key: 'operator-publish-review',
      surface: 'operator',
      channel: 'operator_console',
      status: 'blocked',
      requiresApproval: true,
      readinessChecks: ['governance-bound', 'approval-policy-bound'],
      blockers: ['approval-policy-ui-pending']
    }
  ]
}

function clonePublishItem(item: PublishItem): PublishItem {
  return {
    ...item,
    readinessChecks: [...item.readinessChecks],
    blockers: [...item.blockers]
  }
}

export function getCanonicalPublishRegistry() {
  return {
    public: canonicalPublishRegistry.public.map(clonePublishItem),
    client: canonicalPublishRegistry.client.map(clonePublishItem),
    operator: canonicalPublishRegistry.operator.map(clonePublishItem)
  }
}

export function getPublishItemsForSurface(surface: PublishSurface) {
  return canonicalPublishRegistry[surface].map(clonePublishItem)
}

export function buildPublishPlan(surface: PublishSurface): PublishPlan {
  const items = getPublishItemsForSurface(surface)
  const unresolvedBlockers = Array.from(
    new Set(items.flatMap((item) => item.blockers))
  )

  return {
    surface,
    items,
    summary: {
      publishedCount: items.filter((item) => item.status === 'published').length,
      readyCount: items.filter((item) => item.status === 'ready').length,
      blockedCount: items.filter((item) => item.status === 'blocked').length
    },
    unresolvedBlockers
  }
}

export function canPublishItem(item: PublishItem) {
  return item.status !== 'blocked' && item.blockers.length === 0
}

export function getPublishingSystemAudit() {
  return {
    registry: getCanonicalPublishRegistry(),
    plans: {
      public: buildPublishPlan('public'),
      client: buildPublishPlan('client'),
      operator: buildPublishPlan('operator')
    },
    proofScope: {
      functional: 'channel-aware publishing contract available',
      visible: 'pending actual publish UI adoption',
      data: 'canonical publish items and statuses fixed',
      governance: 'approval and blocker rules available'
    }
  }
}