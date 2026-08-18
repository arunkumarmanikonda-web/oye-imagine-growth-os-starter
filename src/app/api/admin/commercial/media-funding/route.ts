import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { listMediaFundingRequests, rejectMediaFundingRequest, submitMediaFundingRequest, verifyMediaFundingRequest } from '@/lib/commercial/media-funding'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function failure(error: unknown) {
  if (error instanceof ApiAccessError) return json({ ok: false, code: error.code, error: error.message }, error.status)
  const code = error instanceof Error ? error.message.split(':')[0] : 'media_funding_admin_failed'
  const status = code.includes('invalid') || code.includes('required') || code.includes('future') ? 400 : code.includes('not_found') ? 404 : code.includes('maker_checker') || code.includes('platform_owner') || code.includes('mismatch') ? 403 : code.includes('not_') || code.includes('already_submitted') ? 409 : 500
  return json({ ok: false, code, error: 'Media funding review could not be completed.' }, status)
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const result = await listMediaFundingRequests(access, request.nextUrl.searchParams.get('workspaceId') || undefined)
    return json({ ok: true, ...result })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const body = await request.json().catch(() => ({}))
    const operation = String(body.operation || 'submit')
    if (operation === 'submit') {
      const funding = await submitMediaFundingRequest(access, {
        workspaceId: body.workspaceId,
        amount: body.amount,
        currency: body.currency,
        remittanceReference: String(body.remittanceReference || ''),
        paidAt: body.paidAt ? String(body.paidAt) : null,
        note: body.note ? String(body.note) : null,
        evidence: {
          bankName: body.evidence?.bankName,
          payerName: body.evidence?.payerName,
          sourceAccountLast4: body.evidence?.sourceAccountLast4,
          proofReference: body.evidence?.proofReference,
        },
      })
      return json({ ok: true, funding }, 201)
    }
    if (operation === 'verify') {
      const result = await verifyMediaFundingRequest(access, { workspaceId: body.workspaceId, requestId: String(body.requestId || ''), note: body.note ? String(body.note) : null })
      return json({ ok: true, result })
    }
    if (operation === 'reject') {
      const funding = await rejectMediaFundingRequest(access, { workspaceId: body.workspaceId, requestId: String(body.requestId || ''), reason: String(body.reason || '') })
      return json({ ok: true, funding })
    }
    return json({ ok: false, code: 'media_funding_operation_unknown' }, 400)
  } catch (error) {
    return failure(error)
  }
}
