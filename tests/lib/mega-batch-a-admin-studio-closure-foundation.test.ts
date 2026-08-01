import { describe, expect, it } from 'vitest'
import {
  buildAdminStudioState,
  canAccessStudioSection,
  getAdminStudioAudit,
  getAdminStudioRegistry
} from '../../src/lib/recovery/admin-studio-closure-foundation'

describe('mega batch a admin studio closure foundation', () => {
  it('publishes a canonical admin studio registry', () => {
    const registry = getAdminStudioRegistry()

    expect(registry.sections).toHaveLength(4)
    expect(registry.actions).toHaveLength(4)
    expect(registry.sections.map((section) => section.key)).toEqual([
      'content_studio',
      'publish_control',
      'config_control',
      'support_desk'
    ])
  })

  it('enforces section access by operator role', () => {
    const registry = getAdminStudioRegistry()
    const configSection = registry.sections.find((section) => section.key === 'config_control')
    const supportSection = registry.sections.find((section) => section.key === 'support_desk')

    expect(configSection).toBeDefined()
    expect(supportSection).toBeDefined()
    expect(canAccessStudioSection('super_admin', configSection!)).toBe(true)
    expect(canAccessStudioSection('content_manager', configSection!)).toBe(false)
    expect(canAccessStudioSection('support_operator', supportSection!)).toBe(true)
  })

  it('builds a super admin studio state with full access', () => {
    const state = buildAdminStudioState('super_admin')

    expect(state.accessibleSections).toHaveLength(4)
    expect(state.availableActions).toHaveLength(4)
    expect(state.queueSummary).toEqual({
      totalQueues: 4,
      totalItems: 10
    })
  })

  it('builds a content manager state with content and publish access only', () => {
    const state = buildAdminStudioState('content_manager')

    expect(state.accessibleSections.map((section) => section.key)).toEqual([
      'content_studio',
      'publish_control'
    ])
    expect(state.availableActions.map((action) => action.key)).toEqual([
      'edit_content',
      'publish_changes'
    ])
    expect(state.queueSummary).toEqual({
      totalQueues: 2,
      totalItems: 5
    })
  })

  it('builds a support operator state with support-only operational access', () => {
    const state = buildAdminStudioState('support_operator')

    expect(state.accessibleSections.map((section) => section.key)).toEqual([
      'support_desk'
    ])
    expect(state.availableActions.map((action) => action.key)).toEqual([
      'respond_support'
    ])
    expect(state.queueSummary).toEqual({
      totalQueues: 1,
      totalItems: 4
    })
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getAdminStudioAudit()

    expect(audit.states.super_admin.queueSummary.totalItems).toBe(10)
    expect(audit.proofScope).toEqual({
      functional: 'role-aware admin studio contract available',
      visible: 'pending actual admin studio UI adoption',
      data: 'canonical studio sections, actions and queue counts fixed',
      governance: 'access and operator action rules available'
    })
  })
})