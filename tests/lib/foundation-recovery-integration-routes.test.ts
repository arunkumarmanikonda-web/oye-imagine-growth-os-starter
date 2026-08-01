import { describe, expect, it } from 'vitest'
import {
  RECOVERY_ROUTE_GROUPS,
  listAllIntegratedRoutes,
} from '@/lib/recovery/recovery-integration-manifest'

describe('foundation-recovery-integration-routes', () => {
  it('contains the required public, client and operator route families', () => {
    const routes = listAllIntegratedRoutes()

    expect(routes).toContain('/')
    expect(routes).toContain('/login/client')
    expect(routes).toContain('/login/admin')
    expect(routes).toContain('/client/commercial')
    expect(routes).toContain('/client/concierge')
    expect(routes).toContain('/admin/commercial/dashboard')
    expect(routes).toContain('/admin/ai-concierge')
  })

  it('keeps marketplace and support integrations visible', () => {
    expect(RECOVERY_ROUTE_GROUPS.marketplace).toContain('/marketplace/ai')
    expect(RECOVERY_ROUTE_GROUPS.support).toContain('/help/assist')
    expect(RECOVERY_ROUTE_GROUPS.support).toContain('/support/center')
  })
})