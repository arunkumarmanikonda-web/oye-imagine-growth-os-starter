import { describe, expect, it } from 'vitest'
import { listRecoveryWorkspaceOptions, resolveRecoveryWorkspaceContext } from '@/lib/recovery/workspace-context'

describe('foundation-recovery-workspace-context', () => {
  it('prefers explicit workspace selection over fallback guessing', () => {
    const options = listRecoveryWorkspaceOptions()
    const neejeeOption = options.find((option) => option.workspaceId === 'workspace_neejee_primary')

    expect(neejeeOption).toBeDefined()

    const context = resolveRecoveryWorkspaceContext(
      {
        sessionId: 'sess_operator',
        role: 'operator',
        email: 'operator@oyeimagine.com',
        displayName: 'Oye Operator',
        isAuthenticated: true,
      },
      'workspace_neejee_primary'
    )

    expect(context.workspaceId).toBe('workspace_neejee_primary')
    expect(context.source).toBe('explicit_selection')
  })

  it('defaults to the canonical control workspace instead of latest-row heuristics', () => {
    const context = resolveRecoveryWorkspaceContext(
      {
        sessionId: 'sess_operator',
        role: 'operator',
        email: 'operator@oyeimagine.com',
        displayName: 'Oye Operator',
        isAuthenticated: true,
      },
      null
    )

    expect(context.workspaceId).toBe('workspace_oye_control')
    expect(context.source).toBe('default_canonical')
    expect(context.description.toLowerCase()).not.toContain('latest')
  })

  it('retains the canonical Neejee option for pilot truth recovery', () => {
    const options = listRecoveryWorkspaceOptions()

    expect(options.some((option) => option.workspaceId === 'workspace_neejee_primary')).toBe(true)
  })
})