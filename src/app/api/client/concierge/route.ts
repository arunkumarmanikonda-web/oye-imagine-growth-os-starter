import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import type { ConciergeSurface } from '@/lib/ai/concierge-retrieval-types'
import { buildVerifiedClientConciergeScope, clientMembershipIsDemo } from '@/lib/client/client-surface-context'

const allowedSurfaces = new Set<ConciergeSurface>(['client_dashboard', 'help_panel', 'support_center'])
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'client' })
    const message = (request.nextUrl.searchParams.get('message') ?? 'Show my available workspace help and next actions')
      .trim()
      .slice(0, 512)
    const requestedSurface = request.nextUrl.searchParams.get('surface') as ConciergeSurface | null
    const surface: ConciergeSurface = requestedSurface && allowedSurfaces.has(requestedSurface)
      ? requestedSurface
      : 'client_dashboard'
    const scope = buildVerifiedClientConciergeScope({ subject: access.subject, membership: access.membership })
    const experience = buildConciergeExperiencePayload(scope, surface, message)

    return json({
      ok: true,
      mode: clientMembershipIsDemo(access.membership) ? 'authenticated_demo_fixture' : 'verified_membership',
      response: experience,
      presets: experience.shell.promptPresets,
      registry: {
        source: clientMembershipIsDemo(access.membership) ? 'authenticated_demo_fixture' : 'verified_membership_scope',
        fixtureData: clientMembershipIsDemo(access.membership),
      },
    })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
    return json({ ok: false, code: 'concierge_unavailable' }, 500)
  }
}
