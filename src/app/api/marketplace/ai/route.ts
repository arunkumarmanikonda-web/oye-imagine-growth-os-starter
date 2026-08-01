import { NextRequest, NextResponse } from 'next/server'
import { buildAiMarketplaceResponse } from '@/lib/ai/marketplace-engine'
import { getAiMarketplacePromptPresets, getAiMarketplaceRegistrySummary } from '@/lib/ai/marketplace-registry'

function isSurface(value: string): value is 'client' | 'admin' {
  return value === 'client' || value === 'admin'
}

export async function GET(request: NextRequest) {
  const workspaceKey = request.nextUrl.searchParams.get('workspaceKey') ?? 'neejee'
  const message = request.nextUrl.searchParams.get('message') ?? 'Show the best marketplace offers for this workspace'
  const referenceDate = request.nextUrl.searchParams.get('referenceDate') ?? '2026-08-05T00:00:00.000Z'
  const surfaceValue = request.nextUrl.searchParams.get('surface') ?? 'client'
  const surface = isSurface(surfaceValue) ? surfaceValue : 'client'

  return NextResponse.json({
    response: buildAiMarketplaceResponse({
      workspaceKey,
      surface,
      message,
      referenceDate,
    }),
    presets: getAiMarketplacePromptPresets(workspaceKey),
    registry: getAiMarketplaceRegistrySummary(),
  })
}