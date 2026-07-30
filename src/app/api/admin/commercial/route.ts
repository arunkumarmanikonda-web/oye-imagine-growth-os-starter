import { NextRequest, NextResponse } from 'next/server'
import { buildCommercialAutomationJobs, getCommercialAutomationSummary } from '@/lib/commercial/commercial-automation'
import { getCommercialHardeningSnapshot } from '@/lib/commercial/commercial-hardening'

export async function GET(request: NextRequest) {
  const workspaceKey = request.nextUrl.searchParams.get('workspaceKey') ?? 'all'
  const referenceDate = request.nextUrl.searchParams.get('referenceDate') ?? '2026-08-05T00:00:00.000Z'

  return NextResponse.json({
    summary: getCommercialAutomationSummary(workspaceKey, referenceDate),
    jobs: buildCommercialAutomationJobs(workspaceKey, referenceDate),
    snapshot: getCommercialHardeningSnapshot(referenceDate),
  })
}