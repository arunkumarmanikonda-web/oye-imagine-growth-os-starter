import { describe, expect, it } from 'vitest'
import {
  detectRuntimeSurface,
  getWorkspaceTruthAudit,
  normalizeHost,
  normalizeWorkspaceKey,
  resolveWorkspaceTruth
} from '../../src/lib/recovery/workspace-truth-closure-foundation'

describe('mega batch a workspace truth closure foundation', () => {
  it('normalizes workspace aliases into a canonical workspace key', () => {
    expect(normalizeWorkspaceKey('Oye !magine')).toBe('oye-imagine')
    expect(normalizeWorkspaceKey('oyeimagine')).toBe('oye-imagine')
    expect(normalizeWorkspaceKey('')).toBe('oye-imagine')
  })

  it('normalizes hosts before host-driven resolution', () => {
    expect(normalizeHost('https://www.oyeimagine.com/client')).toBe('www.oyeimagine.com')
    expect(normalizeHost('oyeimagine.com')).toBe('oyeimagine.com')
  })

  it('detects runtime surface from pathname when no hint is provided', () => {
    expect(detectRuntimeSurface('/')).toBe('public')
    expect(detectRuntimeSurface('/client/commercial')).toBe('client')
    expect(detectRuntimeSurface('/admin/config')).toBe('operator')
  })

  it('prefers mapped host truth over request or session truth', () => {
    expect(resolveWorkspaceTruth({
      host: 'https://oyeimagine.com/admin',
      pathname: '/admin',
      requestedWorkspaceKey: 'custom-brand',
      sessionWorkspaceKey: 'legacy-tenant'
    })).toMatchObject({
      resolvedWorkspaceKey: 'oye-imagine',
      source: 'host',
      surface: 'operator',
      isCanonical: true
    })
  })

  it('falls back from request to session to default in a deterministic order', () => {
    expect(resolveWorkspaceTruth({
      pathname: '/client',
      requestedWorkspaceKey: '  custom workspace  '
    })).toMatchObject({
      resolvedWorkspaceKey: 'custom-workspace',
      source: 'request',
      surface: 'client'
    })

    expect(resolveWorkspaceTruth({
      pathname: '/client',
      sessionWorkspaceKey: 'session tenant'
    })).toMatchObject({
      resolvedWorkspaceKey: 'session-tenant',
      source: 'session',
      surface: 'client'
    })

    expect(resolveWorkspaceTruth({
      pathname: '/'
    })).toMatchObject({
      resolvedWorkspaceKey: 'oye-imagine',
      source: 'default',
      surface: 'public'
    })
  })

  it('publishes a workspace truth audit contract', () => {
    const audit = getWorkspaceTruthAudit()

    expect(audit.canonicalWorkspaceKey).toBe('oye-imagine')
    expect(audit.hostWorkspaceMap).toEqual({
      'oyeimagine.com': 'oye-imagine',
      'www.oyeimagine.com': 'oye-imagine'
    })
    expect(audit.defaultPaths).toEqual({
      public: '/',
      client: '/client',
      operator: '/admin'
    })
  })
})