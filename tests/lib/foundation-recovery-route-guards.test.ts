import { describe, expect, it } from 'vitest'
import { getRouteAccessDecision } from '@/lib/recovery/route-guards'

describe('foundation-recovery-route-guards', () => {
  it('redirects unauthenticated operator access to the admin login route', () => {
    const decision = getRouteAccessDecision(
      {
        sessionId: null,
        role: 'public',
        email: null,
        displayName: null,
        isAuthenticated: false,
      },
      'operator'
    )

    expect(decision.allow).toBe(false)
    expect(decision.redirectTo).toBe('/login/admin')
    expect(decision.reason).toBe('missing_session')
  })

  it('redirects role mismatch away from protected surfaces', () => {
    const operatorBlockedFromClient = getRouteAccessDecision(
      {
        sessionId: 'sess_operator',
        role: 'operator',
        email: 'operator@oyeimagine.com',
        displayName: 'Oye Operator',
        isAuthenticated: true,
      },
      'client'
    )

    const clientBlockedFromOperator = getRouteAccessDecision(
      {
        sessionId: 'sess_client',
        role: 'client',
        email: 'client@oyeimagine.com',
        displayName: 'Oye Client',
        isAuthenticated: true,
      },
      'operator'
    )

    expect(operatorBlockedFromClient.allow).toBe(false)
    expect(operatorBlockedFromClient.redirectTo).toBe('/admin')
    expect(clientBlockedFromOperator.allow).toBe(false)
    expect(clientBlockedFromOperator.redirectTo).toBe('/client')
  })

  it('allows matching authenticated role access', () => {
    const decision = getRouteAccessDecision(
      {
        sessionId: 'sess_client',
        role: 'client',
        email: 'client@oyeimagine.com',
        displayName: 'Oye Client',
        isAuthenticated: true,
      },
      'client'
    )

    expect(decision.allow).toBe(true)
    expect(decision.reason).toBe('authenticated')
  })
})