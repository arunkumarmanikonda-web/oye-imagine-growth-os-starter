import { describe, expect, it } from 'vitest'

import { chooseProviderFromMetrics, scoreProviderMetric } from '@/lib/ai/provider-routing'

describe('closed-loop provider routing', () => {
  it('preserves deterministic OpenAI-first behavior until enough evidence exists', () => {
    const decision = chooseProviderFromMetrics({
      configuredProviders: ['openai', 'anthropic'],
      metrics: [
        { provider: 'openai', attempts: 2, successes: 2, averageSuccessfulCostUsd: 0.01, recentFailureRate: 0 },
        { provider: 'anthropic', attempts: 2, successes: 2, averageSuccessfulCostUsd: 0.001, recentFailureRate: 0 },
      ],
    })

    expect(decision.provider).toBe('openai')
    expect(decision.reason).toBe('insufficient-history')
  })

  it('selects the lower cost reliable provider after sufficient task evidence exists', () => {
    const decision = chooseProviderFromMetrics({
      configuredProviders: ['openai', 'anthropic'],
      metrics: [
        { provider: 'openai', attempts: 8, successes: 8, averageSuccessfulCostUsd: 0.012, recentFailureRate: 0 },
        { provider: 'anthropic', attempts: 8, successes: 8, averageSuccessfulCostUsd: 0.004, recentFailureRate: 0 },
      ],
    })

    expect(decision.provider).toBe('anthropic')
    expect(decision.reason).toBe('learned-cost-reliability')
  })

  it('penalizes repeated failures enough to avoid a superficially cheaper provider', () => {
    const reliable = scoreProviderMetric({
      provider: 'openai', attempts: 10, successes: 10, averageSuccessfulCostUsd: 0.008, recentFailureRate: 0,
    })
    const unreliable = scoreProviderMetric({
      provider: 'anthropic', attempts: 10, successes: 5, averageSuccessfulCostUsd: 0.001, recentFailureRate: 0.5,
    })

    expect(reliable).toBeLessThan(unreliable)
  })

  it('uses the only configured live provider without requiring history', () => {
    const decision = chooseProviderFromMetrics({ configuredProviders: ['anthropic'], metrics: [] })
    expect(decision).toMatchObject({ provider: 'anthropic', reason: 'single-configured-provider' })
  })
})
