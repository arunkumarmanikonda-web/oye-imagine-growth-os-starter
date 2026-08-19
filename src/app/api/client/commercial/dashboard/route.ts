import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { buildClientCommercialDashboard } from '@/lib/recovery/commercial-dashboard-foundation'
import { clientMembershipDisplayName, clientMembershipIsDemo } from '@/lib/client/client-surface-context'

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'client' })
    const isDemo = clientMembershipIsDemo(access.membership)

    if (!isDemo) {
      return json({
        ok: true,
        mode: 'verified_membership',
        liveDashboardAvailable: false,
        client: {
          displayName: clientMembershipDisplayName(access.membership),
          tenantId: access.membership.tenant_id,
          workspaceId: access.membership.workspace_id,
          brandId: access.membership.brand_id,
        },
        message: 'No verified commercial dashboard records are attached to this membership on this surface yet. Prototype commercial state is disabled for production client accounts.',
      })
    }

    const body = await request.json().catch(() => ({}))
    return json({
      ok: true,
      mode: 'authenticated_demo_fixture',
      fixtureData: true,
      dashboard: buildClientCommercialDashboard(body),
    })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
    return json({ ok: false, code: 'commercial_dashboard_unavailable' }, 500)
  }
}
