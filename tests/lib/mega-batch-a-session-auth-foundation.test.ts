import { describe, expect, it } from 'vitest'
import {
  getRouteAudience,
  getSessionAccessAudit,
  normalizePath,
  resolveSessionAccess,
} from '../../src/lib/recovery/session-auth-foundation'

describe('mega batch a session auth foundation', () => {
  it('normalizes paths and classifies route audiences', () => {
    expect(normalizePath('client/commercial')).toBe('/client/commercial')
    expect(getRouteAudience('/')).toBe('public')
    expect(getRouteAudience('/login')).toBe('public')
    expect(getRouteAudience('/login/client')).toBe('public')
    expect(getRouteAudience('/login/admin')).toBe('public')
    expect(getRouteAudience('/client/commercial')).toBe('client')
    expect(getRouteAudience('/admin/config')).toBe('operator')
  })

  it('redirects unauthenticated users to the correct login entry', () => {
    const publicSession = { isAuthenticated: false, role: null, userId: null, workspaceId: null }

    expect(resolveSessionAccess('/client/commercial', publicSession)).toMatchObject({
      allowed: false,
      redirectTo: '/login/client?redirectTo=%2Fclient%2Fcommercial',
      reason: 'authentication-required',
    })

    expect(resolveSessionAccess('/admin/config', publicSession)).toMatchObject({
      allowed: false,
      redirectTo: '/login/admin?redirectTo=%2Fadmin%2Fconfig',
      reason: 'authentication-required',
    })
  })

  it('prevents client users from entering operator routes', () => {
    const clientSession = { isAuthenticated: true, role: 'client', userId: 'c_1', workspaceId: 'neejee' } as const

    expect(resolveSessionAccess('/admin/support', clientSession)).toMatchObject({
      allowed: false,
      redirectTo: '/client',
      reason: 'client-cannot-open-operator-route',
    })
  })

  it('prevents operator users from entering client routes', () => {
    const operatorSession = { isAuthenticated: true, role: 'operator', userId: 'o_1', workspaceId: 'neejee' } as const

    expect(resolveSessionAccess('/client/commercial/payments', operatorSession)).toMatchObject({
      allowed: false,
      redirectTo: '/admin',
      reason: 'operator-cannot-open-client-route',
    })
  })

  it('allows same-audience access for authenticated sessions', () => {
    const clientSession = { isAuthenticated: true, role: 'client', userId: 'c_1', workspaceId: 'neejee' } as const
    const operatorSession = { isAuthenticated: true, role: 'operator', userId: 'o_1', workspaceId: 'neejee' } as const

    expect(resolveSessionAccess('/client', clientSession)).toMatchObject({
      allowed: true,
      reason: 'authorized',
    })

    expect(resolveSessionAccess('/admin/content', operatorSession)).toMatchObject({
      allowed: true,
      reason: 'authorized',
    })
  })

  it('publishes an audit summary for redirect contracts', () => {
    const audit = getSessionAccessAudit()

    expect(audit.loginEntries).toEqual(['/login/client', '/login/admin'])
    expect(audit.denialMap).toEqual({
      publicToClient: '/login/client',
      publicToOperator: '/login/admin',
      clientToOperator: '/client',
      operatorToClient: '/admin',
    })
  })
})
