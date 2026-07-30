import { describe, expect, it } from 'vitest'
import { AI_MARKETPLACE_CATEGORIES, AI_MARKETPLACE_INTENTS, AI_MARKETPLACE_SURFACES, AI_MARKETPLACE_TONES } from '../../src/lib/ai/marketplace-types'

describe('marketplace-types', () => {
  it('exposes supported marketplace surfaces and tones', () => {
    expect(AI_MARKETPLACE_SURFACES).toEqual(['client', 'admin'])
    expect(AI_MARKETPLACE_TONES).toEqual(['positive', 'neutral', 'attention'])
  })

  it('exposes supported marketplace intents and categories', () => {
    expect(AI_MARKETPLACE_INTENTS).toEqual([
      'billing_optimization',
      'growth_execution',
      'launch_acceleration',
      'seo_visibility',
      'reporting_visibility',
      'renewal_expansion',
      'general_discovery',
    ])
    expect(AI_MARKETPLACE_CATEGORIES).toContain('reporting_analytics')
  })
})