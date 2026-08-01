import { describe, expect, it } from 'vitest'
import { buildNeejeeTruthSnapshot, getCanonicalNeejeeProfile } from '@/lib/recovery/neejee-foundation'
import {
  ACTIVE_WORKSPACE_COOKIE_KEY,
  buildWorkspaceContext,
  resolveWorkspaceSelection,
} from '@/lib/recovery/workspace-foundation'

describe('mega batch a workspace and neejee truth foundation', () => {
  it('prefers query selection when allowed', () => {
    const selection = resolveWorkspaceSelection({
      role: 'operator',
      requestedWorkspaceId: 'workspace_oye_internal',
      cookieWorkspaceId: 'workspace_neejee_primary',
      allowedWorkspaceIds: ['workspace_neejee_primary', 'workspace_oye_internal'],
    })

    expect(selection.workspace.workspaceId).toBe('workspace_oye_internal')
    expect(selection.source).toBe('query')
    expect(selection.isStable).toBe(true)
  })

  it('falls back to cookie selection when query is invalid', () => {
    const selection = resolveWorkspaceSelection({
      role: 'client',
      requestedWorkspaceId: 'workspace_oye_internal',
      cookieWorkspaceId: 'workspace_neejee_primary',
      allowedWorkspaceIds: ['workspace_neejee_primary'],
    })

    expect(selection.workspace.workspaceId).toBe('workspace_neejee_primary')
    expect(selection.source).toBe('cookie')
    expect(selection.isStable).toBe(true)
  })

  it('falls back to default workspace when no valid input exists', () => {
    const selection = resolveWorkspaceSelection({
      role: 'client',
      requestedWorkspaceId: 'missing_workspace',
      cookieWorkspaceId: 'missing_workspace',
      allowedWorkspaceIds: ['workspace_neejee_primary'],
    })

    expect(selection.workspace.workspaceId).toBe('workspace_neejee_primary')
    expect(selection.source).toBe('default')
    expect(selection.isStable).toBe(false)
  })

  it('builds operator workspace context and exposes available workspaces', () => {
    const context = buildWorkspaceContext({
      role: 'operator',
      allowedWorkspaceIds: ['workspace_neejee_primary', 'workspace_oye_internal'],
    })

    expect(context.availableWorkspaces.length).toBe(2)
    expect(context.activeBrandName.length).toBeGreaterThan(0)
    expect(ACTIVE_WORKSPACE_COOKIE_KEY).toBe('oye_active_workspace')
  })

  it('builds canonical neejee truth snapshot without blank critical fields', () => {
    const neejee = getCanonicalNeejeeProfile()
    const snapshot = buildNeejeeTruthSnapshot()

    expect(neejee.brandName).toBe('Neejee')
    expect(snapshot.hasBlankCriticalFields).toBe(false)
    expect(snapshot.deprecatedSources).toContain('pilot-fixtures')
    expect(snapshot.supportEmail).toBe('hello@oyeimagine.com')
  })
})