import { describe, expect, it } from 'vitest'
import {
  buildPublishPlan,
  canPublishItem,
  getCanonicalPublishRegistry,
  getPublishItemsForSurface,
  getPublishingSystemAudit
} from '../../src/lib/recovery/publishing-system-closure-foundation'

describe('mega batch a publishing system closure foundation', () => {
  it('publishes a canonical publish registry for all three surfaces', () => {
    const registry = getCanonicalPublishRegistry()

    expect(Object.keys(registry)).toEqual(['public', 'client', 'operator'])
    expect(registry.public[0].key).toBe('public-homepage')
    expect(registry.client[0].channel).toBe('client_portal')
    expect(registry.operator[0].channel).toBe('operator_console')
  })

  it('returns canonical publish items for a requested surface', () => {
    const clientItems = getPublishItemsForSurface('client')

    expect(clientItems).toHaveLength(2)
    expect(clientItems.every((item) => item.surface === 'client')).toBe(true)
    expect(clientItems.map((item) => item.key)).toEqual([
      'client-dashboard-welcome',
      'client-support-panel'
    ])
  })

  it('builds a public publish plan with accurate summary and blockers', () => {
    const plan = buildPublishPlan('public')

    expect(plan.summary).toEqual({
      publishedCount: 1,
      readyCount: 0,
      blockedCount: 1
    })
    expect(plan.unresolvedBlockers).toEqual(['proof-assets-pending'])
  })

  it('builds client and operator publish plans with ready and blocked states', () => {
    const clientPlan = buildPublishPlan('client')
    const operatorPlan = buildPublishPlan('operator')

    expect(clientPlan.summary).toEqual({
      publishedCount: 0,
      readyCount: 1,
      blockedCount: 1
    })
    expect(operatorPlan.summary).toEqual({
      publishedCount: 0,
      readyCount: 1,
      blockedCount: 1
    })
  })

  it('allows only non-blocked items with no blockers to publish', () => {
    const publicItems = getPublishItemsForSurface('public')
    const clientItems = getPublishItemsForSurface('client')

    expect(canPublishItem(publicItems[0])).toBe(true)
    expect(canPublishItem(publicItems[1])).toBe(false)
    expect(canPublishItem(clientItems[0])).toBe(true)
    expect(canPublishItem(clientItems[1])).toBe(false)
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getPublishingSystemAudit()

    expect(audit.plans.operator.unresolvedBlockers).toEqual(['approval-policy-ui-pending'])
    expect(audit.proofScope).toEqual({
      functional: 'channel-aware publishing contract available',
      visible: 'pending actual publish UI adoption',
      data: 'canonical publish items and statuses fixed',
      governance: 'approval and blocker rules available'
    })
  })
})