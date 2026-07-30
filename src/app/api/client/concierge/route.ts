import { NextRequest, NextResponse } from 'next/server'
import { buildAiConciergeResponse } from '@/lib/ai/concierge-engine'
import { getAiConciergePromptPresets, getAiConciergeRegistrySummary } from '@/lib/ai/concierge-registry'

function isSurface(value: string): value is 'client' | 'admin' {
  return value === 'client' || value === 'admin'
}

export async function GET(request: NextRequest) {
  const workspaceKey = request.nextUrl.searchParams.get('workspaceKey') ?? 'neejee'
  const message = request.nextUrl.searchParams.get('message') ?? 'Show my outstanding invoices and next actions'
  const referenceDate = request.nextUrl.searchParams.get('referenceDate') ?? '2026-08-05T00:00:00.000Z'
  const surfaceValue = request.nextUrl.searchParams.get('surface') ?? 'client'
  const surface = isSurface(surfaceValue) ? surfaceValue : 'client'

  return NextResponse.json({
    response: buildAiConciergeResponse({
      workspaceKey,
      surface,
      message,
      referenceDate,
    }),
    presets: getAiConciergePromptPresets(workspaceKey),
    registry: getAiConciergeRegistrySummary(),
  })
}