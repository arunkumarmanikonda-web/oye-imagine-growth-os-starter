import { NextResponse } from 'next/server'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildPublicSupportConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') ?? 'contact support and show published help routes').trim().slice(0, 512)

  return NextResponse.json(
    buildConciergeExperiencePayload(buildPublicSupportConciergeScope(), 'support_center', query),
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
  )
}
