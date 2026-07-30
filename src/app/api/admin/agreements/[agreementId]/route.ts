import { NextRequest, NextResponse } from 'next/server'
import { transitionAgreementStatus, getAgreementReadiness } from '@/lib/agreements/agreement-engine'
import { findAgreementById } from '@/lib/agreements/agreement-registry'
import { AGREEMENT_STATUSES, type AgreementStatus } from '@/lib/agreements/agreement-types'

function isAgreementStatus(value: string): value is AgreementStatus {
  return AGREEMENT_STATUSES.includes(value as AgreementStatus)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { agreementId: string } },
) {
  const agreement = findAgreementById(params.agreementId)

  if (!agreement) {
    return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
  }

  return NextResponse.json({
    agreement,
    readiness: getAgreementReadiness(agreement),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { agreementId: string } },
) {
  const existing = findAgreementById(params.agreementId)

  if (!existing) {
    return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  let nextAgreement = { ...existing }

  if (typeof body.title === 'string' && body.title.trim().length > 0) {
    nextAgreement.title = body.title.trim()
  }

  if (Array.isArray(body.notes)) {
    nextAgreement.notes = body.notes.filter((value: unknown): value is string => typeof value === 'string')
  }

  if (typeof body.approvalCount === 'number' && Number.isFinite(body.approvalCount)) {
    nextAgreement.approvalCount = Math.max(0, Math.floor(body.approvalCount))
  }

  if (typeof body.status === 'string' && isAgreementStatus(body.status) && body.status !== existing.status) {
    nextAgreement = transitionAgreementStatus(
      nextAgreement,
      body.status,
      typeof body.actor === 'string' ? body.actor : 'admin@oyeimagine.com',
      typeof body.changedAt === 'string' ? body.changedAt : undefined,
    )
  }

  return NextResponse.json({
    agreement: nextAgreement,
    readiness: getAgreementReadiness(nextAgreement),
    persisted: false,
  })
}