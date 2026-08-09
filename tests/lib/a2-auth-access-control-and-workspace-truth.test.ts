import { describe, expect, it } from 'vitest'
import {
  authCookieKeys,
  buildAuthCookieRecord,
  createLoginRedirectPath,
  resolveAuthSessionFromCookieMap,
} from '@/lib/auth/session'
import { evaluateRouteAccess } from '@/lib/auth/route-access'
import {
  getAdminLoginExperience,
  getClientLoginExperience,
} from '@/lib/recovery/auth-entry-foundation'
import { resolveWorkspaceSelection } from '@/lib/recovery/workspace-foundation'

describe('a2 auth access control and workspace truth', () => {
  it('keeps split login routes as the source of truth', () => {
    expect(getClientLoginExperience().route).toBe('/login/client')
    expect(getAdminLoginExperience().route).toBe('/login/admin')
  })

  it('builds and resolves a client auth cookie record with workspace truth', () => {
    const record = buildAuthCookieRecord({
      lane: 'client',
      email: 'client@neejee.com',
      workspaceSlug: 'workspace_neejee_primary',
      tenantSlug: 'tenant_neejee',
      brandSlug: 'brand_neejee',
      issuedAt: '2026-08-10T00:00:00.000Z',
    })

    expect(record[authCookieKeys.lane]).toBe('client')

    const session = resolveAuthSessionFromCookieMap(record)

    expect(session.isAuthenticated).toBe(true)
    expect(session.lane).toBe('client')
    expect(session.workspaceSlug).toBe('workspace_neejee_primary')
  })

  it('protects client and operator surfaces with lane-safe redirects', () => {
    const anonymous = {
      lane: 'public',
      isAuthenticated: false,
      email: null,
      workspaceSlug: null,
      tenantSlug: null,
      brandSlug: null,
      issuedAt: null,
    } as const

    expect(evaluateRouteAccess('/client', anonymous)).toMatchObject({
      allow: false,
      redirectTo: '/login/client?redirectTo=%2Fclient',
      reason: 'missing_auth',
    })

    expect(evaluateRouteAccess('/admin/settings', anonymous)).toMatchObject({
      allow: false,
      redirectTo: '/login/admin?redirectTo=%2Fadmin%2Fsettings',
      reason: 'missing_auth',
    })
  })

  it('blocks cross-lane redirects', () => {
    expect(createLoginRedirectPath('client', '/admin/settings')).toBe('/client')
    expect(createLoginRedirectPath('admin', '/client')).toBe('/admin')
  })

  it('prevents client selection of operator-only workspaces while preserving operator access', () => {
    const clientSelection = resolveWorkspaceSelection({
      role: 'client',
      requestedWorkspaceId: 'workspace_oye_internal',
      allowedWorkspaceIds: ['workspace_neejee_primary'],
    })

    const operatorSelection = resolveWorkspaceSelection({
      role: 'operator',
      requestedWorkspaceId: 'workspace_oye_internal',
      allowedWorkspaceIds: ['workspace_neejee_primary', 'workspace_oye_internal'],
    })

    expect(clientSelection.workspace.workspaceId).toBe('workspace_neejee_primary')
    expect(operatorSelection.workspace.workspaceId).toBe('workspace_oye_internal')
  })
})
