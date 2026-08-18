export type RoutableModelProvider = 'openai' | 'anthropic'

export type ProviderRoutingMetric = {
  provider: RoutableModelProvider
  attempts: number
  successes: number
  averageSuccessfulCostUsd: number
  recentFailureRate: number
}

export type ProviderRoutingDecision = {
  provider: RoutableModelProvider
  reason: 'single-configured-provider' | 'insufficient-history' | 'learned-cost-reliability'
  score: number
  metrics?: ProviderRoutingMetric
}

const MIN_LEARNING_ATTEMPTS = 3
const FAILURE_PENALTY_USD = 0.02
const UNPROVEN_PENALTY_USD = 0.005

function boundedRate(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(value, 0), 1)
}

function nonNegative(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0
}

export function scoreProviderMetric(metric: ProviderRoutingMetric) {
  const attempts = Math.max(0, Math.floor(metric.attempts))
  const successes = Math.min(Math.max(0, Math.floor(metric.successes)), attempts)
  const reliability = attempts > 0 ? successes / attempts : 0
  const cost = nonNegative(metric.averageSuccessfulCostUsd)
  const recentFailureRate = boundedRate(metric.recentFailureRate)
  const evidencePenalty = attempts < MIN_LEARNING_ATTEMPTS ? UNPROVEN_PENALTY_USD : 0
  const reliabilityPenalty = (1 - reliability) * FAILURE_PENALTY_USD
  const recentFailurePenalty = recentFailureRate * FAILURE_PENALTY_USD

  return Number((cost + reliabilityPenalty + recentFailurePenalty + evidencePenalty).toFixed(8))
}

export function chooseProviderFromMetrics(input: {
  configuredProviders: RoutableModelProvider[]
  metrics: ProviderRoutingMetric[]
}): ProviderRoutingDecision {
  const configured = [...new Set(input.configuredProviders)]

  if (configured.length === 0) {
    throw new Error('model_provider_unavailable')
  }

  if (configured.length === 1) {
    return { provider: configured[0], reason: 'single-configured-provider', score: 0 }
  }

  const byProvider = new Map(input.metrics.map((metric) => [metric.provider, metric]))
  const candidates = configured.map((provider) => {
    const metric = byProvider.get(provider)
    return {
      provider,
      metric,
      score: metric ? scoreProviderMetric(metric) : UNPROVEN_PENALTY_USD,
    }
  })

  const hasLearningEvidence = candidates.some((candidate) => (candidate.metric?.attempts ?? 0) >= MIN_LEARNING_ATTEMPTS)
  if (!hasLearningEvidence) {
    const preferred = candidates.find((candidate) => candidate.provider === 'openai') ?? candidates[0]
    return {
      provider: preferred.provider,
      reason: 'insufficient-history',
      score: preferred.score,
      metrics: preferred.metric,
    }
  }

  candidates.sort((left, right) => {
    if (left.score !== right.score) return left.score - right.score
    const leftSuccesses = left.metric?.successes ?? 0
    const rightSuccesses = right.metric?.successes ?? 0
    if (leftSuccesses !== rightSuccesses) return rightSuccesses - leftSuccesses
    return left.provider.localeCompare(right.provider)
  })

  const winner = candidates[0]
  return {
    provider: winner.provider,
    reason: 'learned-cost-reliability',
    score: winner.score,
    metrics: winner.metric,
  }
}
