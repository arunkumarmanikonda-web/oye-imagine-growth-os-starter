import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiAccessContext } from '@/lib/auth/api-access'

export type CreativeGenerationProvider = 'openai_image' | 'openai_video' | 'fal' | 'fal_video'
export type CreativeGenerationKind = 'image' | 'video'

export type CreativeGenerationRequest = {
  provider: CreativeGenerationProvider
  kind: CreativeGenerationKind
  prompt: string
  title?: string
  purpose?: string
  channel?: string
  campaignId?: string
  idempotencyKey: string
  model?: string
  size?: string
  quality?: string
  seconds?: number
  sourceImageUrl?: string
}

type OperationalContext = {
  tenantId: string
  brandId: string | null
  workspaceId: string | null
  actorUserId: string
}

function metadataString(access: ApiAccessContext, key: 'operationalTenantId'|'operationalBrandId'|'operationalWorkspaceId') {
  const value = access.membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function operationalContext(access: ApiAccessContext): OperationalContext {
  const tenantId = metadataString(access, 'operationalTenantId') || access.membership.tenant_id
  const brandId = metadataString(access, 'operationalBrandId') || access.membership.brand_id || null
  const workspaceId = metadataString(access, 'operationalWorkspaceId') || access.membership.workspace_id || null
  if (!tenantId) throw new Error('creative_tenant_context_missing')
  return { tenantId, brandId, workspaceId, actorUserId: access.subject }
}

function envNumber(key: string) {
  const n = Number(process.env[key] || 0)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function providerEstimate(provider: CreativeGenerationProvider) {
  if (provider === 'openai_image') return envNumber('OPENAI_IMAGE_ESTIMATED_COST_USD')
  if (provider === 'openai_video') return envNumber('OPENAI_VIDEO_ESTIMATED_COST_USD')
  if (provider === 'fal_video') return envNumber('FAL_VIDEO_ESTIMATED_COST_USD')
  return envNumber('FAL_IMAGE_ESTIMATED_COST_USD')
}

function providerModel(input: CreativeGenerationRequest) {
  if (input.model?.trim()) return input.model.trim()
  if (input.provider === 'openai_image') return process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5'
  if (input.provider === 'openai_video') return process.env.OPENAI_VIDEO_MODEL || 'sora-2'
  if (input.provider === 'fal_video') return process.env.FAL_VIDEO_MODEL || ''
  return process.env.FAL_IMAGE_MODEL || ''
}

function providerConfigured(provider: CreativeGenerationProvider, model: string) {
  if (provider === 'openai_image' || provider === 'openai_video') return Boolean(process.env.OPENAI_API_KEY && model)
  return Boolean(process.env.FAL_KEY && model)
}

function safeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function promptHash(prompt: string) {
  return crypto.createHash('sha256').update(prompt.trim()).digest('hex')
}

function fileHash(bytes: Uint8Array) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function periodStart(period: 'daily'|'monthly') {
  const now = new Date()
  if (period === 'daily') now.setUTCHours(0,0,0,0)
  else { now.setUTCDate(1); now.setUTCHours(0,0,0,0) }
  return now.toISOString()
}

async function enforceLimit(ctx: OperationalContext, input: CreativeGenerationRequest, estimatedCost: number) {
  const admin = createSupabaseAdminClient()
  const { data: limits, error } = await admin.from('creative_generation_limits')
    .select('period,max_jobs,max_cost_usd,max_video_seconds,workspace_id')
    .eq('tenant_id', ctx.tenantId)
    .eq('enabled', true)
  if (error) throw new Error(`creative_limit_read_failed:${error.message}`)

  const selected = (limits ?? []).filter((limit) => !limit.workspace_id || limit.workspace_id === ctx.workspaceId)
  for (const limit of selected) {
    const period = limit.period === 'daily' ? 'daily' : 'monthly'
    if (input.kind === 'video' && limit.max_video_seconds != null && (input.seconds ?? 4) > Number(limit.max_video_seconds)) {
      throw new Error('creative_video_duration_limit_exceeded')
    }
    const { data: jobs, error: jobsError } = await admin.from('creative_generation_jobs')
      .select('estimated_cost_usd,actual_cost_usd')
      .eq('tenant_id', ctx.tenantId)
      .gte('created_at', periodStart(period))
      .in('status', ['queued','running','succeeded'])
    if (jobsError) throw new Error(`creative_limit_usage_read_failed:${jobsError.message}`)
    if (limit.max_jobs != null && (jobs ?? []).length >= Number(limit.max_jobs)) throw new Error('creative_job_limit_exceeded')
    const spend = (jobs ?? []).reduce((sum, job) => sum + Number(job.actual_cost_usd ?? job.estimated_cost_usd ?? 0), 0)
    if (limit.max_cost_usd != null && spend + estimatedCost > Number(limit.max_cost_usd)) throw new Error('creative_cost_limit_exceeded')
  }
}

async function bucketForTenant(tenantId: string) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('creative_asset_buckets')
    .select('bucket_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('bucket_kind', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error || !data?.bucket_id) throw new Error('creative_asset_bucket_missing')
  return data.bucket_id as string
}

async function createJob(ctx: OperationalContext, input: CreativeGenerationRequest, model: string, estimatedCost: number) {
  const admin = createSupabaseAdminClient()
  const generationJobId = safeId('cgj')
  const payload = {
    generation_job_id: generationJobId,
    tenant_id: ctx.tenantId,
    brand_id: ctx.brandId,
    workspace_id: ctx.workspaceId,
    campaign_id: input.campaignId || null,
    task_key: input.kind === 'image' ? 'creative.image.generate' : 'creative.video.generate',
    provider_key: input.provider,
    model_key: model,
    idempotency_key: input.idempotencyKey,
    status: 'queued',
    prompt_template_key: 'direct_prompt',
    prompt_template_version: '1',
    prompt_hash: promptHash(input.prompt),
    input_refs: input.sourceImageUrl ? [{ type: 'image_url', url: input.sourceImageUrl }] : [],
    request_settings: { size: input.size, quality: input.quality, seconds: input.seconds, title: input.title, purpose: input.purpose, channel: input.channel },
    estimated_cost_usd: estimatedCost,
    attempt_count: 0,
    max_attempts: 3,
    created_by: ctx.actorUserId,
  }
  const { data, error } = await admin.from('creative_generation_jobs').insert(payload).select('*').single()
  if (!error) return data
  if (String(error.code) === '23505') {
    const { data: existing } = await admin.from('creative_generation_jobs').select('*').eq('tenant_id', ctx.tenantId).eq('idempotency_key', input.idempotencyKey).maybeSingle()
    if (existing) return existing
  }
  throw new Error(`creative_job_create_failed:${error.message}`)
}

async function updateJob(jobId: string, patch: Record<string, unknown>) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('creative_generation_jobs').update({ ...patch, updated_at: new Date().toISOString() }).eq('generation_job_id', jobId).select('*').single()
  if (error) throw new Error(`creative_job_update_failed:${error.message}`)
  return data
}

async function persistAsset(input: {
  ctx: OperationalContext
  job: any
  generation: CreativeGenerationRequest
  bytes: Uint8Array
  mimeType: string
  extension: string
  providerPayload?: Record<string, unknown>
}) {
  const admin = createSupabaseAdminClient()
  const bucket = await bucketForTenant(input.ctx.tenantId)
  const assetId = safeId('asset')
  const versionId = safeId('assetv')
  const sha256 = fileHash(input.bytes)
  const path = `generated/${input.generation.kind}/${new Date().toISOString().slice(0,10)}/${assetId}.${input.extension}`
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, input.bytes, { contentType: input.mimeType, upsert: false })
  if (uploadError) throw new Error(`creative_asset_upload_failed:${uploadError.message}`)

  const base = {
    asset_id: assetId, tenant_id: input.ctx.tenantId, brand_id: input.ctx.brandId, workspace_id: input.ctx.workspaceId,
    campaign_id: input.generation.campaignId || null, source_generation_job_id: input.job.generation_job_id,
    storage_bucket: bucket, storage_path: path, asset_kind: input.generation.kind, purpose: input.generation.purpose || 'generated_creative',
    channel: input.generation.channel || null, mime_type: input.mimeType, sha256, byte_size: input.bytes.byteLength,
    title: input.generation.title || `${input.generation.kind} creative`, status: 'generated',
    metadata: { provider: input.job.provider_key, model: input.job.model_key, promptHash: input.job.prompt_hash, providerPayload: input.providerPayload || {} },
    created_by: input.ctx.actorUserId,
  }
  const { error: assetError } = await admin.from('creative_assets').insert(base)
  if (assetError) throw new Error(`creative_asset_row_failed:${assetError.message}`)
  const { error: versionError } = await admin.from('creative_asset_versions').insert({
    version_id: versionId, asset_id: assetId, tenant_id: input.ctx.tenantId, version_number: 1,
    storage_bucket: bucket, storage_path: path, mime_type: input.mimeType, sha256, byte_size: input.bytes.byteLength,
    transformation: {}, provenance: { provider: input.job.provider_key, model: input.job.model_key, externalJobId: input.job.external_job_id || null },
    created_by: input.ctx.actorUserId,
  })
  if (versionError) throw new Error(`creative_asset_version_failed:${versionError.message}`)
  await admin.from('creative_asset_rights').insert({
    rights_id: safeId('rights'), asset_id: assetId, tenant_id: input.ctx.tenantId, asset_owner: 'tenant', source: input.job.provider_key,
    usage_rights: 'provider_terms_and_client_policy', territory: 'configured_campaign_territories', channel_permissions: input.generation.channel ? [input.generation.channel] : [],
    ai_generation_status: 'ai_generated', rights_status: 'cleared', restrictions: [], metadata: { model: input.job.model_key }, created_by: input.ctx.actorUserId,
  })
  await updateJob(input.job.generation_job_id, { status: 'succeeded', output_asset_id: assetId, output_refs: [{ assetId, bucket, path, sha256 }], completed_at: new Date().toISOString() })
  return { assetId, bucket, path, sha256 }
}

async function downloadUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`creative_provider_asset_download_failed:${response.status}`)
  return { bytes: new Uint8Array(await response.arrayBuffer()), mimeType: response.headers.get('content-type') || 'application/octet-stream' }
}

function firstMediaUrl(value: unknown): string | null {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value
  if (Array.isArray(value)) for (const item of value) { const found = firstMediaUrl(item); if (found) return found }
  if (value && typeof value === 'object') for (const item of Object.values(value as Record<string, unknown>)) { const found = firstMediaUrl(item); if (found) return found }
  return null
}

async function generateOpenAIImage(input: CreativeGenerationRequest) {
  const apiKey = process.env.OPENAI_API_KEY; if (!apiKey) throw new Error('openai_not_configured')
  const model = providerModel(input)
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: input.prompt, size: input.size || '1024x1024', quality: input.quality || 'auto', output_format: 'webp', n: 1 }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`openai_image_failed:${payload?.error?.code || response.status}`)
  const b64 = payload?.data?.[0]?.b64_json
  if (typeof b64 !== 'string' || !b64) throw new Error('openai_image_empty_response')
  return { bytes: new Uint8Array(Buffer.from(b64, 'base64')), mimeType: 'image/webp', extension: 'webp', externalJobId: payload?.id || null, payload: { usage: payload?.usage || null } }
}

async function createOpenAIVideo(input: CreativeGenerationRequest) {
  const apiKey = process.env.OPENAI_API_KEY; if (!apiKey) throw new Error('openai_not_configured')
  const form = new FormData(); form.set('model', providerModel(input)); form.set('prompt', input.prompt); form.set('seconds', String(input.seconds || 4)); form.set('size', input.size || '720x1280')
  const response = await fetch('https://api.openai.com/v1/videos', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.id) throw new Error(`openai_video_failed:${payload?.error?.code || response.status}`)
  return payload
}

async function enqueueFal(input: CreativeGenerationRequest) {
  const key = process.env.FAL_KEY; if (!key) throw new Error('fal_not_configured')
  const model = providerModel(input); if (!model) throw new Error('fal_model_not_configured')
  const body: Record<string, unknown> = { prompt: input.prompt }
  if (input.sourceImageUrl) body.image_url = input.sourceImageUrl
  const response = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.request_id) throw new Error(`fal_enqueue_failed:${response.status}`)
  return payload
}

export async function startCreativeGeneration(access: ApiAccessContext, input: CreativeGenerationRequest) {
  if (!input.prompt?.trim() || !input.idempotencyKey?.trim()) throw new Error('creative_request_invalid')
  if ((input.provider.includes('video') && input.kind !== 'video') || (!input.provider.includes('video') && input.kind !== 'image')) throw new Error('creative_provider_kind_mismatch')
  const ctx = operationalContext(access); const model = providerModel(input); if (!providerConfigured(input.provider, model)) throw new Error(`${input.provider}_not_configured`)
  const estimatedCost = providerEstimate(input.provider); await enforceLimit(ctx, input, estimatedCost)
  const job = await createJob(ctx, input, model, estimatedCost)
  if (job.status === 'succeeded' || job.external_job_id) return { job, idempotent: true }
  const started = Date.now(); await updateJob(job.generation_job_id, { status: 'running', started_at: new Date().toISOString(), attempt_count: Number(job.attempt_count || 0) + 1 })
  try {
    if (input.provider === 'openai_image') {
      const output = await generateOpenAIImage(input)
      if (output.externalJobId) await updateJob(job.generation_job_id, { external_job_id: output.externalJobId })
      const asset = await persistAsset({ ctx, job: { ...job, provider_key: input.provider, model_key: model, external_job_id: output.externalJobId }, generation: input, bytes: output.bytes, mimeType: output.mimeType, extension: output.extension, providerPayload: output.payload })
      return { job: await updateJob(job.generation_job_id, { latency_ms: Date.now() - started }), asset }
    }
    if (input.provider === 'openai_video') {
      const external = await createOpenAIVideo(input)
      return { job: await updateJob(job.generation_job_id, { status: external.status === 'failed' ? 'failed' : 'running', external_job_id: external.id, output_refs: [{ type: 'provider_job', provider: 'openai', id: external.id }], latency_ms: Date.now() - started }), external }
    }
    const external = await enqueueFal(input)
    return { job: await updateJob(job.generation_job_id, { status: 'running', external_job_id: external.request_id, output_refs: [{ type: 'fal_queue', statusUrl: external.status_url, responseUrl: external.response_url }], latency_ms: Date.now() - started }), external: { requestId: external.request_id } }
  } catch (error) {
    await updateJob(job.generation_job_id, { status: 'failed', safe_error_code: error instanceof Error ? error.message.split(':')[0] : 'provider_failed', safe_error_message: 'Creative generation provider failed.', latency_ms: Date.now() - started, completed_at: new Date().toISOString() })
    throw error
  }
}

export async function refreshCreativeGeneration(access: ApiAccessContext, generationJobId: string) {
  const ctx = operationalContext(access); const admin = createSupabaseAdminClient()
  const { data: job, error } = await admin.from('creative_generation_jobs').select('*').eq('generation_job_id', generationJobId).eq('tenant_id', ctx.tenantId).maybeSingle()
  if (error || !job) throw new Error('creative_job_not_found')
  if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') return { job }

  if (job.provider_key === 'openai_video') {
    const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('openai_not_configured')
    const statusResponse = await fetch(`https://api.openai.com/v1/videos/${job.external_job_id}`, { headers: { Authorization: `Bearer ${key}` } })
    const status: any = await statusResponse.json().catch(() => ({})); if (!statusResponse.ok) throw new Error(`openai_video_status_failed:${statusResponse.status}`)
    if (status.status === 'failed') return { job: await updateJob(job.generation_job_id, { status: 'failed', safe_error_code: status?.error?.code || 'provider_failed', safe_error_message: 'Video generation failed.', completed_at: new Date().toISOString() }) }
    if (status.status !== 'completed') return { job: await updateJob(job.generation_job_id, { status: 'running', output_refs: [{ type: 'provider_job', provider: 'openai', id: job.external_job_id, progress: status.progress ?? null }] }), external: status }
    const contentResponse = await fetch(`https://api.openai.com/v1/videos/${job.external_job_id}/content`, { headers: { Authorization: `Bearer ${key}` } }); if (!contentResponse.ok) throw new Error(`openai_video_download_failed:${contentResponse.status}`)
    const bytes = new Uint8Array(await contentResponse.arrayBuffer())
    const generation: CreativeGenerationRequest = { provider:'openai_video', kind:'video', prompt:'provider-recorded', idempotencyKey:job.idempotency_key, title:job.request_settings?.title, purpose:job.request_settings?.purpose, channel:job.request_settings?.channel, campaignId:job.campaign_id, seconds:Number(status.seconds || 0), size:status.size }
    const asset = await persistAsset({ ctx, job, generation, bytes, mimeType:contentResponse.headers.get('content-type') || 'video/mp4', extension:'mp4', providerPayload:{ progress:100, size:status.size, seconds:status.seconds } })
    return { job: await updateJob(job.generation_job_id, { status:'succeeded' }), asset }
  }

  if (job.provider_key === 'fal' || job.provider_key === 'fal_video') {
    const key = process.env.FAL_KEY; if (!key) throw new Error('fal_not_configured')
    const ref = Array.isArray(job.output_refs) ? job.output_refs.find((item:any) => item?.type === 'fal_queue') : null
    if (!ref?.statusUrl || !ref?.responseUrl) throw new Error('fal_queue_reference_missing')
    const headers = { Authorization: `Key ${key}` }
    const statusResponse = await fetch(ref.statusUrl, { headers }); const status:any = await statusResponse.json().catch(()=>({})); if(!statusResponse.ok) throw new Error(`fal_status_failed:${statusResponse.status}`)
    const state = String(status.status || '').toUpperCase()
    if (state === 'FAILED') return { job: await updateJob(job.generation_job_id, { status:'failed', safe_error_code:'fal_failed', safe_error_message:'Creative generation failed.', completed_at:new Date().toISOString() }) }
    if (state !== 'COMPLETED') return { job: await updateJob(job.generation_job_id, { status:'running' }), external:{ status:state } }
    const resultResponse = await fetch(ref.responseUrl, { headers }); const result:any = await resultResponse.json().catch(()=>({})); if(!resultResponse.ok) throw new Error(`fal_result_failed:${resultResponse.status}`)
    const url = firstMediaUrl(result); if (!url) throw new Error('fal_media_url_missing')
    const downloaded = await downloadUrl(url); const isVideo = job.provider_key === 'fal_video'; const mimeType = downloaded.mimeType || (isVideo?'video/mp4':'image/webp'); const extension = mimeType.includes('video')?'mp4':mimeType.includes('png')?'png':mimeType.includes('jpeg')?'jpg':'webp'
    const generation: CreativeGenerationRequest = { provider:job.provider_key, kind:isVideo?'video':'image', prompt:'provider-recorded', idempotencyKey:job.idempotency_key, title:job.request_settings?.title, purpose:job.request_settings?.purpose, channel:job.request_settings?.channel, campaignId:job.campaign_id }
    const asset = await persistAsset({ ctx, job, generation, bytes:downloaded.bytes, mimeType, extension, providerPayload:{ requestId:job.external_job_id } })
    return { job: await updateJob(job.generation_job_id,{status:'succeeded'}), asset }
  }
  throw new Error('creative_provider_refresh_unsupported')
}
