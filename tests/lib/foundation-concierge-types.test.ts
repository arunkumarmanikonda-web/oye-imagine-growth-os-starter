import { describe, expect, it } from 'vitest'
import { AI_CONCIERGE_INTENTS, AI_CONCIERGE_SURFACES, AI_CONCIERGE_TONES } from '../../src/lib/ai/concierge-types'

describe('concierge-types', () => {
  it('exposes supported concierge surfaces and tones', () => {
    expect(AI_CONCIERGE_SURFACES).toEqual(['client', 'admin'])
    expect(AI_CONCIERGE_TONES).toEqual(['positive', 'neutral', 'attention'])
  })

  it('exposes supported concierge intents', () => {
    expect(AI_CONCIERGE_INTENTS).toEqual([
      'billing_overview',
      'agreement_status',
      'payment_followup',
      'renewal_guidance',
      'support_handoff',
      'general_navigation',
    ])
  })
})