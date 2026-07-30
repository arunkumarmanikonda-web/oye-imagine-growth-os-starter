import { NextResponse } from 'next/server'
import { getAgreementTemplates } from '@/lib/agreements/agreement-templates'
import { getAgreementRegistry, getAgreementRegistrySummary, getAgreementSummaryCards } from '@/lib/agreements/agreement-registry'

export async function GET() {
  return NextResponse.json({
    summary: getAgreementRegistrySummary(),
    templates: getAgreementTemplates(),
    cards: getAgreementSummaryCards(),
    agreements: getAgreementRegistry(),
  })
}