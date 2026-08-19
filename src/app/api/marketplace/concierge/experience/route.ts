import { NextResponse } from 'next/server'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildPublicMarketplaceConciergeScope } from '@/lib/ai/concierge-retrieval-registry'
import type { ConciergeSurface } from '@/lib/ai/concierge-retrieval-types'

const allowedSurfaces = new Set<ConciergeSurface>(['marketplace_surface', 'help_panel', 'support_center'])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') ?? 'service lanes, specialist matching and marketplace help').trim().slice(0, 512)
  const requestedSurface = searchParams.get('surface') as ConciergeSurface | null
  const surface: ConciergeSurface = requestedSurface && allowedSurfaces.has(requestedSurface)
    ? requestedSurface
    : 'marketplace_surface'

  return NextResponse.json(
    buildConciergeExperiencePayload(buildPublicMarketplaceConciergeScope(), surface, query),
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
  )
}
