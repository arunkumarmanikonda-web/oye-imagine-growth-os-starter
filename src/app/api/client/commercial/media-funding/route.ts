import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { listMediaFundingRequests, submitMediaFundingRequest } from '@/lib/commercial/media-funding'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function failure(error: unknown) {
  if (error instanceof ApiAccessError) return json({ ok: false, code: error.code, error: error.message }, error.status)
  const code = error instanceof Error ? error.message.split(':')[0] : 'media_funding_request_failed'
  const status = code.includes('invalid') || code.includes('required') || code.includes('future') ? 400 : code.includes('already_submitted') ? 409 : code.includes('denied') || code.includes('mismatch') ? 403 : 500
  return json({ ok: false, code, error: 'Media funding request could not be completed.' }, status)
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'client' })
    const result = await listMediaFundingRequests(access, request.nextUrl.searchParams.get('workspaceId') || undefined)
    return json({ ok: true, ...result })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'client' })
    const body = await request.json().catch(() => ({}))
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
  } catch (error) {
    return failure(error)
  }
}
