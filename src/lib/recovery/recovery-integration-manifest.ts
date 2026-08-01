export const RECOVERY_BRANCH_HEADS = {
  megaBatchA: '9603cce',
  megaBatchB: 'f21b08e',
  megaBatchC: '5dd08d0',
} as const

export const RECOVERY_ROUTE_GROUPS = {
  public: [
    '/',
    '/marketplace',
    '/contact',
    '/login',
    '/login/client',
    '/login/admin',
  ],
  client: [
    '/client',
    '/client/agreements',
    '/client/agreements/execution',
    '/client/billing',
    '/client/commercial',
    '/client/concierge',
  ],
  operator: [
    '/admin',
    '/admin/content',
    '/admin/config',
    '/admin/recovery',
    '/admin/commercial',
    '/admin/commercial/execution',
    '/admin/commercial/invoicing',
    '/admin/commercial/dashboard',
    '/admin/ai-concierge',
  ],
  support: [
    '/help/assist',
    '/support/center',
  ],
  marketplace: [
    '/marketplace/ai',
  ],
} as const

export function listAllIntegratedRoutes() {
  return Object.values(RECOVERY_ROUTE_GROUPS).flat()
}

export function getCommercialConciergeCrosswalk() {
  return [
    {
      audience: 'client',
      commercialRoute: '/client/commercial',
      billingRoute: '/client/billing',
      agreementRoute: '/client/agreements/execution',
      conciergeRoute: '/client/concierge',
    },
    {
      audience: 'operator',
      commercialRoute: '/admin/commercial/dashboard',
      billingRoute: '/admin/commercial/invoicing',
      agreementRoute: '/admin/commercial/execution',
      conciergeRoute: '/admin/ai-concierge',
    },
    {
      audience: 'marketplace',
      commercialRoute: '/marketplace',
      billingRoute: '/client/billing',
      agreementRoute: '/client/agreements/execution',
      conciergeRoute: '/marketplace/ai',
    },
  ]
}

export function getRecoveryIntegrationSnapshot() {
  const allRoutes = listAllIntegratedRoutes()
  const uniqueRoutes = new Set(allRoutes)

  return {
    branchHeads: RECOVERY_BRANCH_HEADS,
    routeGroupCount: Object.keys(RECOVERY_ROUTE_GROUPS).length,
    totalRouteCount: allRoutes.length,
    uniqueRouteCount: uniqueRoutes.size,
    duplicateRouteCount: allRoutes.length - uniqueRoutes.size,
    commercialRouteCount: allRoutes.filter((route) =>
      route.includes('/commercial') || route.includes('/billing') || route.includes('/agreements'),
    ).length,
    conciergeRouteCount: allRoutes.filter((route) =>
      route.includes('concierge') || route.includes('/ai') || route.includes('/assist') || route.includes('/support'),
    ).length,
    crosswalkCount: getCommercialConciergeCrosswalk().length,
  }
}

export function getIntegrationValidationGate() {
  const snapshot = getRecoveryIntegrationSnapshot()
  const routeSet = new Set(listAllIntegratedRoutes())

  const requiredRoutes = [
    '/',
    '/login/client',
    '/login/admin',
    '/client/agreements',
    '/client/agreements/execution',
    '/client/billing',
    '/client/commercial',
    '/client/concierge',
    '/admin',
    '/admin/content',
    '/admin/config',
    '/admin/commercial',
    '/admin/commercial/execution',
    '/admin/commercial/invoicing',
    '/admin/commercial/dashboard',
    '/admin/ai-concierge',
    '/marketplace',
    '/marketplace/ai',
    '/help/assist',
    '/support/center',
  ]

  const missingRequiredRoutes = requiredRoutes.filter((route) => !routeSet.has(route as Parameters<typeof routeSet.has>[0]))

  return {
    status:
      missingRequiredRoutes.length === 0 && snapshot.duplicateRouteCount === 0
        ? 'ready'
        : 'attention_required',
    missingRequiredRoutes,
    duplicateRouteCount: snapshot.duplicateRouteCount,
    crosswalkCount: snapshot.crosswalkCount,
    branchHeads: snapshot.branchHeads,
  }
}