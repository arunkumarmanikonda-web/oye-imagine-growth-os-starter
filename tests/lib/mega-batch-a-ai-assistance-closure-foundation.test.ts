import { describe, expect, it } from 'vitest'
import {
  buildAiAssistanceState,
  canUseCapability,
  getAiAssistanceAudit,
  getAiAssistanceRegistry,
  getAiCardsForAudience
} from '../../src/lib/recovery/ai-assistance-closure-foundation'

describe('mega batch a ai assistance closure foundation', () => {
  it('publishes a canonical ai assistance registry', () => {
    const registry = getAiAssistanceRegistry()

    expect(Object.keys(registry)).toEqual(['public', 'client', 'operator'])
    expect(registry.public).toHaveLength(2)
    expect(registry.client).toHaveLength(2)
    expect(registry.operator).toHaveLength(2)
  })

  it('returns audience-specific ai cards', () => {
    const clientCards = getAiCardsForAudience('client')

    expect(clientCards.every((card) => card.audience === 'client')).toBe(true)
    expect(clientCards.map((card) => card.key)).toEqual([
      'client-workspace-guide',
      'client-next-best-action'
    ])
  })

  it('enforces capability usage by card definition', () => {
    const publicCards = getAiCardsForAudience('public')

    expect(canUseCapability(publicCards[0], 'answer')).toBe(true)
    expect(canUseCapability(publicCards[0], 'escalate')).toBe(false)
    expect(canUseCapability(publicCards[1], 'escalate')).toBe(true)
  })

  it('builds a public assistance state with summary counts', () => {
    const state = buildAiAssistanceState('public')

    expect(state.summary).toEqual({
      cardCount: 2,
      approvalRequiredCount: 1,
      capabilityCount: 4
    })
  })

  it('builds an operator assistance state with governed action coverage', () => {
    const state = buildAiAssistanceState('operator')

    expect(state.cards.map((card) => card.key)).toEqual([
      'operator-control-assist',
      'operator-governed-action'
    ])
    expect(state.summary.approvalRequiredCount).toBe(1)
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getAiAssistanceAudit()

    expect(audit.states.client.summary.cardCount).toBe(2)
    expect(audit.proofScope).toEqual({
      functional: 'audience-aware ai assistance contract available',
      visible: 'pending actual ai assistant UI adoption',
      data: 'canonical assistance cards and capability mappings fixed',
      governance: 'approval and escalation rules available'
    })
  })
})