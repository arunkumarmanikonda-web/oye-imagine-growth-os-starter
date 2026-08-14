import { afterEach, describe, expect, it } from 'vitest'
import {
  executeModelGateway,
  getTenantCostLedger,
  resetModelGatewayState,
  type ModelGatewayProviderHandler,
} from '../../src/lib/ai/model-gateway'

const provider: ModelGatewayProviderHandler = async (request) => ({
  ok: true,
  provider: 'openai',
  model: 'test-model',
  requestId: `provider-${request.tenantId}`,
  content: `answer:${request.prompt}`,
  promptTokens: 10,
  completionTokens: 5,
  estimatedCostUsd: 0.02,
  cacheHit: false,
  fallbackUsed: false,
})

afterEach(() => {
  resetModelGatewayState()
  delete process.env.MODEL_GATEWAY_ALLOW_RULE_BASED_FALLBACK
  delete process.env.VERCEL_ENV
})

describe('governed model gateway', () => {
  it('uses the injected provider and records tenant-local cost', async () => {
    const result = await executeModelGateway({
      tenantId: 'tenant-a',
      workspaceId: 'workspace-a',
      taskType: 'strategy',
      prompt: 'Build a craft-commerce strategy',
      maxCostUsd: 0.1,
    }, provider)

    expect(result.provider).toBe('openai')
    expect(result.content).toContain('craft-commerce')
    expect(getTenantCostLedger('tenant-a').spentUsd).toBe(0.02)
  })

  it('does not share an explicit cache key across tenants', async () => {
    let calls = 0
    const countingProvider: ModelGatewayProviderHandler = async (request) => {
      calls += 1
      return provider(request)
    }

    const common = {
      taskType: 'brand-qa',
      prompt: 'same prompt',
      cacheKey: 'same-explicit-key',
      maxCostUsd: 0.1,
    }

    await executeModelGateway({ ...common, tenantId: 'tenant-a', workspaceId: 'workspace-a' }, countingProvider)
    const cached = await executeModelGateway({ ...common, tenantId: 'tenant-a', workspaceId: 'workspace-a' }, countingProvider)
    await executeModelGateway({ ...common, tenantId: 'tenant-b', workspaceId: 'workspace-b' }, countingProvider)

    expect(cached.cacheHit).toBe(true)
    expect(calls).toBe(2)
  })

  it('blocks a provider result above the request cost ceiling', async () => {
    await expect(executeModelGateway({
      tenantId: 'tenant-a',
      taskType: 'expensive-task',
      prompt: 'Do not execute above budget',
      maxCostUsd: 0.01,
    }, provider)).rejects.toThrow('cost cap exceeded')
  })

  it('keeps rule-based fallback explicit rather than defaulting it on in production', async () => {
    process.env.VERCEL_ENV = 'production'
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.MODEL_GATEWAY_ALLOW_RULE_BASED_FALLBACK

    await expect(executeModelGateway({
      tenantId: 'tenant-a',
      taskType: 'strategy',
      prompt: 'production request',
    })).rejects.toThrow()
  })
})
