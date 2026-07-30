import { NextResponse } from 'next/server'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildDemoClientConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query =
    searchParams.get('q') ??
    'where is my overdue invoice, latest report, active agreement and next steps'
  const surface =
    (searchParams.get('surface') as 'client_dashboard' | 'help_panel' | 'support_center' | null) ??
    'client_dashboard'

  const scope = buildDemoClientConciergeScope()

  return NextResponse.json(buildConciergeExperiencePayload(scope, surface, query))
}