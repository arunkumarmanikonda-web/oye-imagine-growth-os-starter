import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { startCreativeGeneration, type CreativeGenerationRequest } from '@/lib/creative/generation-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    let body: unknown
    try { body = await request.json() } catch { return json({ ok: false, code: 'invalid_json' }, 400) }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, code: 'invalid_request' }, 400)
    const input = body as CreativeGenerationRequest
    if (!input.provider || !input.kind || !input.prompt || !input.idempotencyKey) return json({ ok: false, code: 'missing_required_fields' }, 400)
    const result = await startCreativeGeneration(access, input)
    return json({ ok: true, ...result }, 202)
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code, error: error.message }, error.status)
    const code = error instanceof Error ? error.message.split(':')[0] : 'creative_generation_failed'
    const status = code.includes('not_configured') ? 503 : code.includes('limit_exceeded') ? 429 : code.includes('invalid') || code.includes('mismatch') ? 400 : 500
    return json({ ok: false, code, error: 'Creative generation could not be started.' }, status)
  }
}
