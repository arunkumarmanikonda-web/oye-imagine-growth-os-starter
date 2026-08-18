import { NextRequest, NextResponse } from 'next/server'

const MAX_REPORT_BYTES = 32 * 1024
const ALLOWED_CONTENT_TYPES = ['application/csp-report', 'application/reports+json', 'application/json']

function sanitizeValue(value: unknown, maxLength = 500) {
  if (typeof value !== 'string') return undefined
  return value.replace(/[\r\n\t]/g, ' ').slice(0, maxLength)
}

function extractReport(payload: unknown) {
  const candidate = Array.isArray(payload) ? payload[0] : payload
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

  const report = extractReport(payload)
  if (!report) {
    return NextResponse.json({ ok: false, error: 'invalid_report' }, { status: 400 })
  }

  console.info('csp_report_only_violation', report)
  return new NextResponse(null, { status: 204 })
}
