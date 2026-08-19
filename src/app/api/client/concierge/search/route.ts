import { NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { buildVerifiedClientConciergeScope } from '@/lib/client/client-surface-context'
import { answerConciergeQuery, buildConciergeWorkspaceSnapshot } from '@/lib/ai/concierge-retrieval'
import type { ConciergeSurface } from '@/lib/ai/concierge-retrieval-types'

const allowedSurfaces = new Set<ConciergeSurface>(['client_dashboard', 'help_panel', 'support_center'])
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })

export async function GET(request: Request) {
  try {
    const access = await requireApiAccess({ lane: 'client' })
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') ?? 'show my available workspace help and next actions').trim().slice(0, 512)
    const requestedSurface = searchParams.get('surface') as ConciergeSurface | null
    const surface: ConciergeSurface = requestedSurface && allowedSurfaces.has(requestedSurface)
      ? requestedSurface
      : 'client_dashboard'
    const scope = buildVerifiedClientConciergeScope({ subject: access.subject, membership: access.membership })

    return json({
      ok: true,
      scope: { audience: scope.audience, tenantId: access.membership.tenant_id, workspaceId: access.membership.workspace_id },
      snapshot: buildConciergeWorkspaceSnapshot(scope, surface),
      answer: answerConciergeQuery(scope, query, surface),
    })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
    return json({ ok: false, code: 'concierge_unavailable' }, 500)
  }
}
