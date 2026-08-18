import 'server-only'

import { createHash, createHmac } from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type NormalizedCspReport = {
  disposition?: string
  effectiveDirective?: string
  violatedDirective?: string
  documentOrigin?: string
  documentPath?: string
  blockedOrigin?: string
  blockedPath?: string
  sourceOrigin?: string
  sourcePath?: string
  lineNumber?: number
}

const SPECIAL_SOURCES = new Set(['inline', 'eval', 'self', 'data', 'blob', 'about'])

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined
  const clean = value.replace(/[\r\n\t]/g, ' ').trim().slice(0, maxLength)
  return clean || undefined
}

function normalizeUrl(value: unknown) {
  const raw = cleanText(value, 1000)
  if (!raw) return { origin: undefined, path: undefined }
  const lower = raw.toLowerCase()
  for (const source of SPECIAL_SOURCES) {
    if (lower === source || lower.startsWith(`${source}:`)) return { origin: source, path: undefined }
  }
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) return { origin: url.protocol.replace(':', ''), path: undefined }
    return {
      origin: url.origin.toLowerCase().slice(0, 300),
      path: url.pathname.slice(0, 500) || '/',
    }
  } catch {
    return { origin: 'unparseable', path: undefined }
  }
}

export function normalizeCspReport(input: Record<string, unknown>): NormalizedCspReport {
  const document = normalizeUrl(input.blockedDocumentUri ?? input.documentUri)
  const blocked = normalizeUrl(input.blockedUri)
  const source = normalizeUrl(input.sourceFile)
  const line = typeof input.lineNumber === 'number' && Number.isFinite(input.lineNumber)
    ? Math.max(0, Math.trunc(input.lineNumber))
    : undefined

  return {
    disposition: cleanText(input.disposition, 40),
    effectiveDirective: cleanText(input.effectiveDirective, 120),
    violatedDirective: cleanText(input.violatedDirective, 200),
    documentOrigin: document.origin,
    documentPath: document.path,
    blockedOrigin: blocked.origin,
    blockedPath: blocked.path,
    sourceOrigin: source.origin,
    sourcePath: source.path,
    lineNumber: line,
  }
}

function canonical(report: NormalizedCspReport) {
  return JSON.stringify({
    d: report.disposition || '',
    e: report.effectiveDirective || '',
    v: report.violatedDirective || '',
    do: report.documentOrigin || '',
    dp: report.documentPath || '',
    bo: report.blockedOrigin || '',
    bp: report.blockedPath || '',
    so: report.sourceOrigin || '',
    sp: report.sourcePath || '',
    l: report.lineNumber ?? null,
  })
}

function telemetrySecret() {
  const secret = process.env.CSP_REPORT_RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('csp_telemetry_secret_missing')
  return secret
}

export function cspNetworkBucket(networkIdentifier: string) {
  return createHmac('sha256', telemetrySecret()).update(networkIdentifier || 'unknown').digest('hex')
}

export function cspReportFingerprint(report: NormalizedCspReport) {
  return createHash('sha256').update(canonical(report)).digest('hex')
}

export async function recordCspTelemetry(input: { report: NormalizedCspReport; networkIdentifier: string }) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.rpc('record_csp_security_report', {
    p_bucket_key: cspNetworkBucket(input.networkIdentifier),
    p_fingerprint: cspReportFingerprint(input.report),
    p_hour_bucket: new Date().toISOString(),
    p_disposition: input.report.disposition || '',
    p_effective_directive: input.report.effectiveDirective || '',
    p_violated_directive: input.report.violatedDirective || '',
    p_document_origin: input.report.documentOrigin || '',
    p_document_path: input.report.documentPath || '',
    p_blocked_origin: input.report.blockedOrigin || '',
    p_blocked_path: input.report.blockedPath || '',
    p_source_origin: input.report.sourceOrigin || '',
    p_source_path: input.report.sourcePath || '',
    p_line_number: input.report.lineNumber ?? null,
  })
  if (error) throw new Error(`csp_telemetry_write_failed:${error.message}`)
  const row = Array.isArray(data) ? data[0] : data
  return {
    accepted: row?.accepted === true,
    throttled: row?.throttled === true,
    reportCount: typeof row?.stored_report_count === 'number' ? row.stored_report_count : null,
  }
}

export async function listCspTelemetry(hours = 168) {
  const boundedHours = Math.min(24 * 30, Math.max(1, Math.trunc(hours || 168)))
  const since = new Date(Date.now() - boundedHours * 60 * 60 * 1000).toISOString()
  const { data, error } = await createSupabaseAdminClient()
    .from('security_csp_report_buckets')
    .select('report_id,disposition,effective_directive,violated_directive,document_origin,document_path,blocked_origin,blocked_path,source_origin,source_path,line_number,report_count,first_seen_at,last_seen_at')
    .gte('last_seen_at', since)
    .order('last_seen_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(`csp_telemetry_read_failed:${error.message}`)

  const rows = data || []
  const totalReports = rows.reduce((sum, row: any) => sum + Number(row.report_count || 0), 0)
  const blocked = new Map<string, number>()
  const directives = new Map<string, number>()
  for (const row of rows as any[]) {
    const count = Number(row.report_count || 0)
    const blockedKey = String(row.blocked_origin || 'unknown')
    const directiveKey = String(row.effective_directive || row.violated_directive || 'unknown')
    blocked.set(blockedKey, (blocked.get(blockedKey) || 0) + count)
    directives.set(directiveKey, (directives.get(directiveKey) || 0) + count)
  }
  const top = (map: Map<string, number>) => Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  return {
    hours: boundedHours,
    totalReports,
    bucketCount: rows.length,
    topBlockedOrigins: top(blocked),
    topDirectives: top(directives),
    rows,
  }
}
