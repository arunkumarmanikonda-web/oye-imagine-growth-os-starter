import { NextRequest, NextResponse } from 'next/server'
import { normalizeCspReport, recordCspTelemetry } from '@/lib/security/csp-telemetry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_REPORT_BYTES = 32 * 1024
const MAX_REPORTS_PER_REQUEST = 10
const ALLOWED_CONTENT_TYPES = ['application/csp-report', 'application/reports+json', 'application/json']

function sanitizeValue(value: unknown, maxLength = 1000) {
  if (typeof value !== 'string') return undefined
  return value.replace(/[\r\n\t]/g, ' ').slice(0, maxLength)
}

function extractOne(candidate: unknown) {
  if (!candidate || typeof candidate !== 'object') return null
  const root = candidate as Record<string, unknown>
  const body = root['csp-report'] && typeof root['csp-report'] === 'object'
    ? (root['csp-report'] as Record<string, unknown>)
    : root.body && typeof root.body === 'object'
      ? (root.body as Record<string, unknown>)
      : root

  return {
    blockedUri: sanitizeValue(body['blocked-uri'] ?? body.blockedURL),
    documentUri: sanitizeValue(body['document-uri'] ?? body.documentURL),
    effectiveDirective: sanitizeValue(body['effective-directive'] ?? body.effectiveDirective),
    violatedDirective: sanitizeValue(body['violated-directive'] ?? body.violatedDirective),
    sourceFile: sanitizeValue(body['source-file'] ?? body.sourceFile),
    lineNumber: typeof body['line-number'] === 'number' ? body['line-number'] : body.lineNumber,
    disposition: sanitizeValue(body.disposition),
  }
}

function extractReports(payload: unknown) {
  const candidates = Array.isArray(payload) ? payload.slice(0, MAX_REPORTS_PER_REQUEST) : [payload]
  return candidates.map(extractOne).filter((value): value is NonNullable<ReturnType<typeof extractOne>> => Boolean(value))
}

function networkIdentifier(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',', 1)[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown'
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() || ''
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ ok: false, error: 'unsupported_content_type' }, { status: 415 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_REPORT_BYTES) {
    return NextResponse.json({ ok: false, error: 'report_too_large' }, { status: 413 })
  }

  let payload: unknown
  try {
    const raw = await request.text()
    if (Buffer.byteLength(raw, 'utf8') > MAX_REPORT_BYTES) {
      return NextResponse.json({ ok: false, error: 'report_too_large' }, { status: 413 })
    }
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_report' }, { status: 400 })
  }

  const reports = extractReports(payload)
  if (!reports.length) return NextResponse.json({ ok: false, error: 'invalid_report' }, { status: 400 })

  const network = networkIdentifier(request)
  for (const rawReport of reports) {
    const report = normalizeCspReport(rawReport)
    try {
      const result = await recordCspTelemetry({ report, networkIdentifier: network })
      console.info('csp_telemetry_recorded', {
        disposition: report.disposition,
        effectiveDirective: report.effectiveDirective,
        documentOrigin: report.documentOrigin,
        blockedOrigin: report.blockedOrigin,
        accepted: result.accepted,
        throttled: result.throttled,
      })
      if (result.throttled) break
    } catch (error) {
      console.error('csp_telemetry_write_failed', {
        code: error instanceof Error ? error.message.split(':')[0] : 'unknown',
      })
      // Browsers should not retry or surface telemetry-storage failures to users.
      break
    }
  }

  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
}
