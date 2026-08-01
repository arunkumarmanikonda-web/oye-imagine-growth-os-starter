import { describe, expect, it } from 'vitest'
import {
  buildSupportContactState,
  getSupportContactAudit,
  getSupportContactRegistry,
  getSupportContactsForAudience,
  requiresEscalation
} from '../../src/lib/recovery/support-contact-closure-foundation'

describe('mega batch a support contact closure foundation', () => {
  it('publishes a canonical support contact registry', () => {
    const registry = getSupportContactRegistry()

    expect(Object.keys(registry)).toEqual(['public', 'client', 'operator'])
    expect(registry.public).toHaveLength(2)
    expect(registry.client).toHaveLength(2)
    expect(registry.operator).toHaveLength(2)
  })

  it('returns audience-specific support contacts', () => {
    const clientCards = getSupportContactsForAudience('client')

    expect(clientCards.map((card) => card.key)).toEqual([
      'client-portal',
      'client-email'
    ])
    expect(clientCards.every((card) => card.audience === 'client')).toBe(true)
  })

  it('flags support cards with escalation targets as escalation-aware', () => {
    const publicCards = getSupportContactsForAudience('public')

    expect(requiresEscalation(publicCards[0])).toBe(true)
    expect(requiresEscalation(publicCards[1])).toBe(true)
  })

  it('builds a public support state with expected summary counts', () => {
    const state = buildSupportContactState('public')

    expect(state.summary).toEqual({
      cardCount: 2,
      governanceBoundCount: 2,
      escalatedCount: 2
    })
  })

  it('builds an operator support state with admin queue coverage', () => {
    const state = buildSupportContactState('operator')

    expect(state.cards.map((card) => card.key)).toEqual([
      'operator-admin-queue',
      'operator-escalation-phone'
    ])
    expect(state.summary.cardCount).toBe(2)
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getSupportContactAudit()

    expect(audit.states.client.summary.cardCount).toBe(2)
    expect(audit.proofScope).toEqual({
      functional: 'audience-aware support contact contract available',
      visible: 'pending actual support ui adoption',
      data: 'canonical support channels and destinations fixed',
      governance: 'escalation and sla rules available'
    })
  })
})