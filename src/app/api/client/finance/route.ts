import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { getClientFinanceWorkspace } from '@/lib/finance/client-finance'
import { clientMembershipDisplayName, clientMembershipIsDemo } from '@/lib/client/client-surface-context'

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

function safeReferenceDate(value: string | null) {
  if (!value) return '2026-08-01T00:00:00.000Z'
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : '2026-08-01T00:00:00.000Z'
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'client', requiredPermission: 'view_client_finance' })
    const isDemo = clientMembershipIsDemo(access.membership)

    if (!isDemo) {
      return privateJson({
        ok: true,
        mode: 'verified_membership',
        liveFinanceAvailable: false,
        client: {
          displayName: clientMembershipDisplayName(access.membership),
          tenantId: access.membership.tenant_id,
          workspaceId: access.membership.workspace_id,
          brandId: access.membership.brand_id,
        },
        message: 'No verified live finance ledger is attached to this membership on this surface yet. Prototype invoices, agreements and balances are disabled for production client accounts.',
      })
    }

    return privateJson({
      ok: true,
      mode: 'authenticated_demo_fixture',
      fixtureData: true,
      workspace: getClientFinanceWorkspace(
        'neejee',
        safeReferenceDate(request.nextUrl.searchParams.get('referenceDate')),
      ),
    })
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return privateJson({ ok: false, code: error.code }, error.status)
    }

    return privateJson(
      { ok: false, code: 'finance_workspace_unavailable' },
      500,
    )
  }
}
