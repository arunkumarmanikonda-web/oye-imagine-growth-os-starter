import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { decidePermission, type ResolvedPermissionSet } from '@/lib/auth/access-resolver'
import { permissionForPathname } from '@/lib/auth/permissions'
import type { VerifiedMembership } from '@/lib/auth/verified-membership'

export type AskOyeLanguage = 'en' | 'hi' | 'hinglish'
export type AskOyeSearchResult = {
  documentId: string
  domain: string
  title: string
  summary: string
  deepLink: string | null
  score: number
  scope: string
}

const hindiPattern = /[\u0900-\u097F]/
const hinglishHints = ['kya','kaise','mujhe','mera','meri','hamara','kitna','kahan','batao','dikhao','karna','chahiye','wala','wali','hai','hain','nahi','aur']

export function detectAskOyeLanguage(query: string): AskOyeLanguage {
  if (hindiPattern.test(query)) return 'hi'
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const hits = words.filter((word) => hinglishHints.includes(word)).length
  return hits >= 2 ? 'hinglish' : 'en'
}

export function normalizeAskOyeQuery(query: string) {
  const raw = query.trim().replace(/\s+/g, ' ').slice(0, 800)
  const lower = raw.toLowerCase()
  const expansions: string[] = [raw]
  const rules: Array<[RegExp,string]> = [
    [/\b(daam|kimat|keemat|price|pricing|cost)\b/i,'pricing plan subscription'],
    [/\b(creative|design|image|video|reel|post)\b/i,'creative content asset'],
    [/\b(campaign|ads?|boost|keyword)\b/i,'campaign paid media keyword'],
    [/\b(report|performance|result|roas|revenue)\b/i,'reporting analytics performance'],
    [/\b(permission|access|role|rights?)\b/i,'access control permission role'],
    [/\b(invoice|payment|subscription|bill)\b/i,'commercial invoice payment subscription'],
    [/\b(integration|connect|oauth|api)\b/i,'integration connection configuration'],
  ]
  for (const [pattern, expansion] of rules) if (pattern.test(lower)) expansions.push(expansion)
  return Array.from(new Set(expansions)).join(' ')
}

export function askOyeNeedsResearch(query: string) {
  return /\b(strategy|competitor|market|trend|today|latest|best channel|budget|spend|launch|pricing recommendation|seo|keyword|audience|forecast)\b/i.test(query)
}

export function askOyeIsHighImpact(query: string) {
  return /\b(publish|post now|launch|enable|spend|increase budget|decrease budget|pay|delete|send message|send email|send whatsapp|send sms|sign|approve)\b/i.test(query)
}

function canOpen(input: {
  membership: VerifiedMembership
  permissionSet: ResolvedPermissionSet
  deepLink: string | null
}) {
  if (!input.deepLink) return true
  const permission = permissionForPathname(input.deepLink)
  if (!permission) return true
  return decidePermission({
    roleKey: input.membership.role_key,
    membership: input.membership,
    permissionSet: input.permissionSet,
    permission,
  }).allowed
}

function scoreResult(query: string, row: any) {
  const terms = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1)
  const title = String(row.title ?? '').toLowerCase()
  const summary = String(row.summary ?? '').toLowerCase()
  const body = String(row.body ?? '').toLowerCase()
  let score = 0
  for (const term of terms) {
    if (title.includes(term)) score += 8
    if (summary.includes(term)) score += 4
    if (body.includes(term)) score += 1
  }
  if (row.scope_type === 'workspace') score += 3
  else if (row.scope_type === 'tenant') score += 2
  return score
}

async function searchScope(input: {
  query: string
  scopeType: 'platform_public' | 'tenant' | 'workspace'
  tenantId?: string
  workspaceId?: string
}) {
  const admin = createSupabaseAdminClient()
  let request = admin
    .from('ai_global_search_documents')
    .select('document_id,scope_type,tenant_id,workspace_id,domain,title,summary,body,deep_link,action_key,updated_at')
    .eq('scope_type', input.scopeType)

  if (input.tenantId) request = request.eq('tenant_id', input.tenantId)
  if (input.workspaceId) request = request.eq('workspace_id', input.workspaceId)

  const webQuery = input.query.replace(/[&|!:*()'"<>]/g, ' ').trim()
  if (webQuery) request = request.textSearch('search_text', webQuery, { type: 'websearch', config: 'simple' })
  const { data, error } = await request.limit(30)
  if (error) return []
  return data ?? []
}

export async function searchAskOye(input: {
  query: string
  membership: VerifiedMembership
  permissionSet: ResolvedPermissionSet
}): Promise<{ language: AskOyeLanguage; normalizedQuery: string; results: AskOyeSearchResult[] }> {
  const query = input.query.trim().slice(0, 800)
  if (!query) return { language: 'en', normalizedQuery: '', results: [] }
  const normalizedQuery = normalizeAskOyeQuery(query)
  const [publicRows, tenantRows, workspaceRows] = await Promise.all([
    searchScope({ query: normalizedQuery, scopeType: 'platform_public' }),
    searchScope({ query: normalizedQuery, scopeType: 'tenant', tenantId: input.membership.tenant_id }),
    input.membership.workspace_id
      ? searchScope({ query: normalizedQuery, scopeType: 'workspace', tenantId: input.membership.tenant_id, workspaceId: input.membership.workspace_id })
      : Promise.resolve([]),
  ])

  const deduped = new Map<string, any>()
  for (const row of [...publicRows, ...tenantRows, ...workspaceRows]) deduped.set(row.document_id, row)
  const results = Array.from(deduped.values())
    .filter((row) => canOpen({ membership: input.membership, permissionSet: input.permissionSet, deepLink: row.deep_link }))
    .map((row) => ({
      documentId: row.document_id,
      domain: row.domain,
      title: row.title,
      summary: row.summary || '',
      deepLink: row.deep_link || null,
      score: scoreResult(query, row),
      scope: row.scope_type,
    }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 12)

  return { language: detectAskOyeLanguage(query), normalizedQuery, results }
}