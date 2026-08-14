import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { getClientFinanceWorkspace } from '@/lib/finance/client-finance'
import { resolveAuthorizedFinanceWorkspaceKey } from '@/lib/finance/finance-access'

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'client' })
    const requestedWorkspaceKey = request.nextUrl.searchParams.get('workspaceKey')
    const workspaceKey = resolveAuthorizedFinanceWorkspaceKey({
      membership: access.membership,
      requestedWorkspaceKey,
      platformOwnerDefault: 'neejee',
    })

    if (!workspaceKey) {
      return privateJson(
        {
          ok: false,
          error: 'The signed-in identity is not authorized for this finance workspace.',
          code: 'workspace_access_denied',
        },
        403,
      )
    }

    const referenceDate =
      request.nextUrl.searchParams.get('referenceDate') ??
      '2026-08-01T00:00:00.000Z'

    return privateJson({
      ok: true,
      workspace: getClientFinanceWorkspace(workspaceKey, referenceDate),
    })
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return privateJson(
        { ok: false, error: error.message, code: error.code },
        error.status,
      )
    }

    return privateJson(
      { ok: false, error: 'Unable to load finance workspace.' },
      500,
    )
  }
}
