import { NextResponse } from 'next/server'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildDemoMarketplaceConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query =
    searchParams.get('q') ??
    'service lanes, proposal status, request status, specialist availability and approved deliverables'
  const surface =
    (searchParams.get('surface') as 'marketplace_surface' | 'help_panel' | 'support_center' | null) ??
    'marketplace_surface'

  const scope = buildDemoMarketplaceConciergeScope()

  return NextResponse.json(buildConciergeExperiencePayload(scope, surface, query))
}