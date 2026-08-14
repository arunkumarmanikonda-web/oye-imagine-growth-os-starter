import crypto from 'node:crypto'

export type ModelGatewayProvider = 'rule-based' | 'openai' | 'anthropic' | 'fallback'
export type LiveModelProvider = 'openai' | 'anthropic'

export type ModelGatewayRequest = {
  tenantId?: string
  workspaceId?: string
  pilotId?: string
  taskType: string
  prompt: string
  cacheKey?: string
  cacheTtlSeconds?: number
  maxCostUsd?: number
  monthlyCostCapUsd?: number
  maxOutputTokens?: number
  preferredProvider?: LiveModelProvider
}

export type ModelGatewayResponse = {
  ok: boolean
  provider: ModelGatewayProvider
  model?: string
  requestId?: string
  content: string
  promptTokens: number
  completionTokens: number
  estimatedCostUsd: number
  cacheHit: boolean
  fallbackUsed: boolean
}

export type ModelGatewayProviderHandler = (
  request: ModelGatewayRequest,
) => Promise<ModelGatewayResponse>

type CostLedgerEntry = { tenantId: string; spentUsd: number }
type ProviderRates = { input: number; output: number; configured: boolean }

const responseCache = new Map<string, ModelGatewayResponse>()
const costLedger = new Map<string, CostLedgerEntry>()

function isProduction() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

function normalizeTenantId(value?: string) {
  const trimmed = value?.trim()
  return trimmed || 'default-tenant'
}

function normalizeWorkspaceId(value?: string) {
  return value?.trim() || 'no-workspace'
}

function numericEnv(key: string) {
  const raw = process.env[key]
  if (!raw) return 0
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

function providerRates(provider: LiveModelProvider): ProviderRates {
  const prefix = provider === 'openai' ? 'OPENAI' : 'ANTHROPIC'
  const input = numericEnv(`${prefix}_INPUT_USD_PER_MILLION`)
  const output = numericEnv(`${prefix}_OUTPUT_USD_PER_MILLION`)
  return { input, output, configured: input > 0 || output > 0 }
}

function calculateCost(provider: LiveModelProvider, promptTokens: number, completionTokens: number) {
  const rates = providerRates(provider)
  return Number((((promptTokens * rates.input) + (completionTokens * rates.output)) / 1_000_000).toFixed(8))
}

function estimateTokens(value: string) {
  const normalized = value.trim()
  return normalized ? Math.max(1, Math.ceil(normalized.length / 4)) : 0
}

function buildCacheKey(request: ModelGatewayRequest) {
  const material = request.cacheKey?.trim() || [
    normalizeTenantId(request.tenantId),
    normalizeWorkspaceId(request.workspaceId),
    request.pilotId?.trim() || 'no-pilot',
    request.taskType.trim(),
    request.preferredProvider || 'auto',
    request.prompt.trim(),
  ].join('::')
  return crypto.createHash('sha256').update(material).digest('hex')
}

function buildRequestId() {
  return `ai_${crypto.randomUUID()}`
}

function readLedger(tenantId: string): CostLedgerEntry {
  return costLedger.get(tenantId) ?? { tenantId, spentUsd: 0 }
}

async function getAdminClient() {
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
  return createSupabaseAdminClient()
}

async function readPersistentCache(cacheKey: string, tenantId: string): Promise<ModelGatewayResponse | null> {
  try {
    const admin = await getAdminClient()
    const { data, error } = await admin
      .from('ai_response_cache')
      .select('response_payload,expires_at')
      .eq('cache_key', cacheKey)
      .eq('tenant_id', tenantId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    if (error || !data?.response_payload) return null
    return { ...(data.response_payload as ModelGatewayResponse), cacheHit: true }
  } catch {
    return null
  }
}

async function persistCache(cacheKey: string, request: ModelGatewayRequest, result: ModelGatewayResponse) {
  try {
    const admin = await getAdminClient()
    const ttl = Math.min(Math.max(request.cacheTtlSeconds ?? 3600, 60), 86400)
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()
    const { error } = await admin.from('ai_response_cache').upsert({
      cache_key: cacheKey,
      tenant_id: normalizeTenantId(request.tenantId),
      workspace_id: request.workspaceId?.trim() || null,
      task_type: request.taskType,
      provider: result.provider,
      model: result.model || 'unknown',
      response_payload: result,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cache_key', ignoreDuplicates: false })
    if (error && isProduction()) throw new Error(`ai_cache_persistence_failed:${error.message}`)
  } catch (error) {
    if (isProduction()) throw error
  }
}

async function monthSpendUsd(tenantId: string) {
  try {
    const admin = await getAdminClient()
    const start = new Date()
    start.setUTCDate(1); start.setUTCHours(0,0,0,0)
    const { data, error } = await admin
      .from('ai_usage_ledger')
      .select('estimated_cost_usd')
      .eq('tenant_id', tenantId)
      .eq('status', 'succeeded')
      .gte('created_at', start.toISOString())
    if (error) throw error
    return (data ?? []).reduce((sum, row) => sum + Number(row.estimated_cost_usd || 0), 0)
  } catch (error) {
    if (isProduction()) throw new Error(`ai_cost_ledger_read_failed:${error instanceof Error ? error.message : 'unknown'}`)
    return readLedger(tenantId).spentUsd
  }
}

async function persistUsage(input: {
  request: ModelGatewayRequest
  result?: ModelGatewayResponse
  requestId: string
  status: 'succeeded' | 'failed' | 'blocked'
  errorCode?: string
}) {
  const tenantId = normalizeTenantId(input.request.tenantId)
  const result = input.result
  const row = {
    tenant_id: tenantId,
    workspace_id: input.request.workspaceId?.trim() || null,
    pilot_id: input.request.pilotId?.trim() || null,
    task_type: input.request.taskType,
    request_id: input.requestId,
    provider: result?.provider || input.request.preferredProvider || 'unavailable',
    model: result?.model || 'unknown',
    prompt_tokens: result?.promptTokens || 0,
    completion_tokens: result?.completionTokens || 0,
    estimated_cost_usd: result?.estimatedCostUsd || 0,
    cache_hit: result?.cacheHit || false,
    status: input.status,
    error_code: input.errorCode || null,
    metadata: {
      pricingConfigured: result?.provider === 'openai' || result?.provider === 'anthropic'
        ? providerRates(result.provider).configured
        : false,
    },
  }
  try {
    const admin = await getAdminClient()
    const { error } = await admin.from('ai_usage_ledger').insert(row)
    if (error) throw error
  } catch (error) {
    if (isProduction()) throw new Error(`ai_usage_persistence_failed:${error instanceof Error ? error.message : 'unknown'}`)
  }
  if (input.status === 'succeeded' && result) {
    const current = readLedger(tenantId)
    costLedger.set(tenantId, { tenantId, spentUsd: Number((current.spentUsd + result.estimatedCostUsd).toFixed(8)) })
  }
}

function extractOpenAIText(payload: any) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim()
  const texts: string[] = []
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (typeof content?.text === 'string') texts.push(content.text)
    }
  }
  return texts.join('\n').trim()
}

async function openAIProvider(request: ModelGatewayRequest): Promise<ModelGatewayResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('openai_not_configured')
  const model = process.env.OPENAI_TEXT_MODEL || 'gpt-5'
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: request.prompt,
      max_output_tokens: Math.min(Math.max(request.maxOutputTokens ?? 1200, 64), 8000),
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`openai_request_failed:${payload?.error?.code || response.status}`)
  const content = extractOpenAIText(payload)
  if (!content) throw new Error('openai_empty_response')
  const promptTokens = Number(payload?.usage?.input_tokens || estimateTokens(request.prompt))
  const completionTokens = Number(payload?.usage?.output_tokens || estimateTokens(content))
  return {
    ok: true, provider: 'openai', model, requestId: payload?.id,
    content, promptTokens, completionTokens,
    estimatedCostUsd: calculateCost('openai', promptTokens, completionTokens),
    cacheHit: false, fallbackUsed: false,
  }
}

async function anthropicProvider(request: ModelGatewayRequest): Promise<ModelGatewayResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('anthropic_not_configured')
  const model = process.env.ANTHROPIC_TEXT_MODEL || 'claude-sonnet-4-20250514'
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: Math.min(Math.max(request.maxOutputTokens ?? 1200, 64), 8000),
      messages: [{ role: 'user', content: request.prompt }],
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`anthropic_request_failed:${payload?.error?.type || response.status}`)
  const content = (Array.isArray(payload?.content) ? payload.content : [])
    .filter((item: any) => item?.type === 'text' && typeof item.text === 'string')
    .map((item: any) => item.text)
    .join('\n')
    .trim()
  if (!content) throw new Error('anthropic_empty_response')
  const promptTokens = Number(payload?.usage?.input_tokens || estimateTokens(request.prompt))
  const completionTokens = Number(payload?.usage?.output_tokens || estimateTokens(content))
  return {
    ok: true, provider: 'anthropic', model, requestId: payload?.id,
    content, promptTokens, completionTokens,
    estimatedCostUsd: calculateCost('anthropic', promptTokens, completionTokens),
    cacheHit: false, fallbackUsed: false,
  }
}

async function ruleBasedProvider(request: ModelGatewayRequest): Promise<ModelGatewayResponse> {
  const promptTokens = estimateTokens(request.prompt)
  return {
    ok: true, provider: 'rule-based', model: 'deterministic-test-fallback',
    content: `RULE-BASED RESPONSE :: ${request.taskType} :: ${request.prompt}`,
    promptTokens, completionTokens: 0, estimatedCostUsd: 0,
    cacheHit: false, fallbackUsed: true,
  }
}

function chooseProvider(request: ModelGatewayRequest): ModelGatewayProviderHandler {
  if (request.preferredProvider === 'openai') {
    if (process.env.OPENAI_API_KEY) return openAIProvider
    throw new Error('openai_not_configured')
  }
  if (request.preferredProvider === 'anthropic') {
    if (process.env.ANTHROPIC_API_KEY) return anthropicProvider
    throw new Error('anthropic_not_configured')
  }
  if (process.env.OPENAI_API_KEY) return openAIProvider
  if (process.env.ANTHROPIC_API_KEY) return anthropicProvider
  const allowSynthetic = process.env.MODEL_GATEWAY_ALLOW_RULE_BASED_FALLBACK === 'true' || !isProduction()
  if (allowSynthetic) return ruleBasedProvider
  throw new Error('model_provider_unavailable')
}

export async function executeModelGateway(
  request: ModelGatewayRequest,
  providerHandler?: ModelGatewayProviderHandler,
): Promise<ModelGatewayResponse> {
  if (!request.taskType?.trim() || !request.prompt?.trim()) throw new Error('invalid_model_gateway_request')
  const tenantId = normalizeTenantId(request.tenantId)
  const cacheKey = buildCacheKey(request)
  const requestId = buildRequestId()

  const localCached = responseCache.get(cacheKey)
  if (localCached) return { ...localCached, cacheHit: true }
  const persistentCached = await readPersistentCache(cacheKey, tenantId)
  if (persistentCached) {
    responseCache.set(cacheKey, { ...persistentCached, cacheHit: false })
    await persistUsage({ request, result: persistentCached, requestId, status: 'succeeded' })
    return persistentCached
  }

  const monthlySpent = await monthSpendUsd(tenantId)
  if (request.monthlyCostCapUsd !== undefined && monthlySpent >= request.monthlyCostCapUsd) {
    await persistUsage({ request, requestId, status: 'blocked', errorCode: 'monthly_cost_cap_exceeded' })
    throw new Error(`Model gateway monthly cost cap exceeded for tenant '${tenantId}'.`)
  }

  let result: ModelGatewayResponse
  try {
    result = await (providerHandler || chooseProvider(request))(request)
  } catch (error) {
    await persistUsage({ request, requestId, status: 'failed', errorCode: error instanceof Error ? error.message.slice(0, 160) : 'provider_failed' })
    throw error
  }

  const maxCostUsd = request.maxCostUsd ?? 1
  if (result.estimatedCostUsd > maxCostUsd || (request.monthlyCostCapUsd !== undefined && monthlySpent + result.estimatedCostUsd > request.monthlyCostCapUsd)) {
    await persistUsage({ request, result, requestId, status: 'blocked', errorCode: 'cost_cap_exceeded' })
    throw new Error(`Model gateway cost cap exceeded for tenant '${tenantId}'.`)
  }

  const persisted: ModelGatewayResponse = { ...result, requestId: result.requestId || requestId, cacheHit: false }
  await persistUsage({ request, result: persisted, requestId, status: 'succeeded' })
  await persistCache(cacheKey, request, persisted)
  responseCache.set(cacheKey, persisted)
  return persisted
}

export function getTenantCostLedger(tenantId?: string): CostLedgerEntry {
  return readLedger(normalizeTenantId(tenantId))
}

export async function getTenantCostLedgerPersistent(tenantId?: string): Promise<CostLedgerEntry> {
  const normalized = normalizeTenantId(tenantId)
  return { tenantId: normalized, spentUsd: Number((await monthSpendUsd(normalized)).toFixed(8)) }
}

export function resetModelGatewayState() {
  responseCache.clear()
  costLedger.clear()
}
