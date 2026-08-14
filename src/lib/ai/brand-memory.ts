import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiAccessContext } from '@/lib/auth/api-access'

export type BrandKnowledgeTarget = { tenantId: string; brandId: string; workspaceId: string }
export type KnowledgeCitation = { chunkId: string; sourceId: string; sourceTitle: string; sourceUri: string | null; version: string; freshness: string; content: string; score: number | null }

function sha(value: string) { return crypto.createHash('sha256').update(value).digest('hex') }
function tokenEstimate(value: string) { return Math.max(1, Math.ceil(value.length / 4)) }

export async function resolveKnowledgeTarget(access: ApiAccessContext, requestedWorkspaceId?: string): Promise<BrandKnowledgeTarget> {
  const admin = createSupabaseAdminClient()
  const membership = access.membership
  const isPlatformOwner = membership.role_key === 'platform_owner'
  const workspaceId = requestedWorkspaceId?.trim() || membership.workspace_id
  if (!workspaceId) throw new Error('knowledge_workspace_required')
  if (!isPlatformOwner && workspaceId !== membership.workspace_id) throw new Error('knowledge_workspace_denied')
  const { data, error } = await admin.from('core_workspaces').select('workspace_id,tenant_id,brand_id,status').eq('workspace_id', workspaceId).eq('status', 'active').maybeSingle()
  if (error || !data) throw new Error('knowledge_workspace_not_found')
  if (!isPlatformOwner && data.tenant_id !== membership.tenant_id) throw new Error('knowledge_tenant_denied')
  return { tenantId: data.tenant_id, brandId: data.brand_id, workspaceId: data.workspace_id }
}

function chunkText(content: string, maxChars = 3200, overlap = 320) {
  const normalized = content.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  if (!normalized) return []
  const chunks: string[] = []
  let start = 0
  while (start < normalized.length) {
    let end = Math.min(normalized.length, start + maxChars)
    if (end < normalized.length) {
      const boundary = Math.max(normalized.lastIndexOf('\n\n', end), normalized.lastIndexOf('. ', end), normalized.lastIndexOf(' ', end))
      if (boundary > start + Math.floor(maxChars * 0.65)) end = boundary + 1
    }
    chunks.push(normalized.slice(start, end).trim())
    if (end >= normalized.length) break
    start = Math.max(start + 1, end - overlap)
  }
  return chunks.filter(Boolean)
}

async function embed(text: string): Promise<{ vector: number[]; model: string } | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
  const response = await fetch('https://api.openai.com/v1/embeddings', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, input: text, dimensions: 1536 }) })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !Array.isArray(payload?.data?.[0]?.embedding)) throw new Error(`embedding_failed:${payload?.error?.code || response.status}`)
  return { vector: payload.data[0].embedding, model }
}

export async function ingestBrandKnowledge(input: {
  access: ApiAccessContext; workspaceId?: string; sourceType: 'website'|'document'|'catalogue'|'campaign'|'guideline'|'manual'|'api'|'note';
  sourceUri?: string; title: string; versionLabel?: string; content: string; metadata?: Record<string, unknown>
}) {
  const target = await resolveKnowledgeTarget(input.access, input.workspaceId)
  const content = input.content.trim(); if (!content) throw new Error('knowledge_content_required')
  const chunks = chunkText(content); if (!chunks.length) throw new Error('knowledge_content_empty')
  const admin = createSupabaseAdminClient(); const contentHash = sha(content)
  const { data: source, error: sourceError } = await admin.from('brand_knowledge_sources').upsert({
    tenant_id: target.tenantId, brand_id: target.brandId, workspace_id: target.workspaceId, source_type: input.sourceType,
    source_uri: input.sourceUri?.trim() || null, title: input.title.trim(), version_label: input.versionLabel?.trim() || 'v1',
    content_sha256: contentHash, freshness_status: 'current', source_metadata: input.metadata || {}, ingested_by: input.access.email || input.access.subject,
    refreshed_at: new Date().toISOString(), deleted_at: null,
  }, { onConflict: 'tenant_id,content_sha256' }).select('*').single()
  if (sourceError) throw new Error(`knowledge_source_write_failed:${sourceError.message}`)
  await admin.from('brand_knowledge_chunks').delete().eq('source_id', source.source_id)
  const rows = []
  for (let ordinal = 0; ordinal < chunks.length; ordinal++) {
    const chunk = chunks[ordinal]
    let embedding: { vector: number[]; model: string } | null = null
    try { embedding = await embed(chunk) } catch { embedding = null }
    rows.push({ source_id: source.source_id, tenant_id: target.tenantId, brand_id: target.brandId, workspace_id: target.workspaceId, ordinal, content: chunk, content_sha256: sha(chunk), token_estimate: tokenEstimate(chunk), metadata: { sourceType: input.sourceType }, embedding: embedding ? JSON.stringify(embedding.vector) : null, embedding_model: embedding?.model || null, embedded_at: embedding ? new Date().toISOString() : null })
  }
  const { error: chunkError } = await admin.from('brand_knowledge_chunks').insert(rows)
  if (chunkError) throw new Error(`knowledge_chunks_write_failed:${chunkError.message}`)
  return { sourceId: source.source_id as string, target, chunkCount: rows.length, embeddingCount: rows.filter((r) => r.embedding).length }
}

async function citationRows(rows: any[]): Promise<KnowledgeCitation[]> {
  if (!rows.length) return []
  const admin = createSupabaseAdminClient(); const sourceIds = [...new Set(rows.map((r) => r.source_id))]
  const { data: sources } = await admin.from('brand_knowledge_sources').select('source_id,title,source_uri,version_label,freshness_status').in('source_id', sourceIds)
  const byId = new Map((sources || []).map((s: any) => [s.source_id, s]))
  return rows.map((row: any) => { const source: any = byId.get(row.source_id) || {}; return { chunkId: row.chunk_id, sourceId: row.source_id, sourceTitle: source.title || 'Source', sourceUri: source.source_uri || null, version: source.version_label || 'v1', freshness: source.freshness_status || 'unknown', content: row.content, score: typeof row.similarity === 'number' ? row.similarity : null } })
}

export async function retrieveBrandKnowledge(input: { access: ApiAccessContext; workspaceId?: string; query: string; limit?: number }) {
  const target = await resolveKnowledgeTarget(input.access, input.workspaceId); const query = input.query.trim(); if (!query) throw new Error('knowledge_query_required')
  const limit = Math.min(Math.max(input.limit || 8, 1), 20); const admin = createSupabaseAdminClient()
  let rows: any[] = []
  try {
    const embedded = await embed(query)
    if (embedded) {
      const { data, error } = await admin.rpc('match_brand_knowledge', { p_tenant_id: target.tenantId, p_workspace_id: target.workspaceId, p_query_embedding: JSON.stringify(embedded.vector), p_match_count: limit, p_min_similarity: 0.25 })
      if (!error && Array.isArray(data)) rows = data
    }
  } catch { rows = [] }
  if (!rows.length) {
    const { data, error } = await admin.from('brand_knowledge_chunks').select('chunk_id,source_id,content,metadata').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).textSearch('content', query, { type: 'websearch', config: 'simple' }).limit(limit)
    if (!error && Array.isArray(data)) rows = data
  }
  if (!rows.length) {
    const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length >= 3).slice(0, 4)
    const { data } = await admin.from('brand_knowledge_chunks').select('chunk_id,source_id,content,metadata').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).limit(100)
    rows = (data || []).map((row: any) => ({ ...row, lexical: terms.reduce((score, term) => score + (row.content.toLowerCase().includes(term) ? 1 : 0), 0) })).filter((row: any) => row.lexical > 0).sort((a: any,b: any) => b.lexical-a.lexical).slice(0, limit)
  }
  return { target, citations: await citationRows(rows) }
}

export async function deleteKnowledgeSource(access: ApiAccessContext, sourceId: string, workspaceId?: string) {
  const target = await resolveKnowledgeTarget(access, workspaceId); const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('brand_knowledge_sources').update({ deleted_at: new Date().toISOString(), freshness_status: 'archived' }).eq('source_id', sourceId).eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).select('source_id').maybeSingle()
  if (error || !data) throw new Error('knowledge_source_not_found')
  const { error: deleteError } = await admin.from('brand_knowledge_chunks').delete().eq('source_id', sourceId).eq('tenant_id', target.tenantId)
  if (deleteError) throw new Error(`knowledge_source_delete_failed:${deleteError.message}`)
  return { ok: true, sourceId }
}
