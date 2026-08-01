import { NextResponse } from 'next/server'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildDemoClientConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query =
    searchParams.get('q') ??
    'contact support, open support requests and show me the next actions I should take'

  return NextResponse.json(
    buildConciergeExperiencePayload(buildDemoClientConciergeScope(), 'support_center', query)
  )
}