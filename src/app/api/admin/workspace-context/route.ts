import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildRecoveryAuthSessionFromCookieStore, getSelectedWorkspaceIdFromCookieStore } from '@/lib/recovery/auth-session-server'
import { getRouteAccessDecision } from '@/lib/recovery/route-guards'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'
import { listRecoveryWorkspaceOptions, resolveRecoveryWorkspaceContext } from '@/lib/recovery/workspace-context'

export async function GET() {
  const cookieStore = await cookies()
  const session = buildRecoveryAuthSessionFromCookieStore(cookieStore)
  const decision = getRouteAccessDecision(session, 'operator')

  if (!decision.allow) {
    return NextResponse.json(
      { error: 'operator_access_required', redirectTo: decision.redirectTo },
      { status: 401 }
    )
  }

  return NextResponse.json({
    session,
    options: listRecoveryWorkspaceOptions(),
    context: resolveRecoveryWorkspaceContext(
      session,
      getSelectedWorkspaceIdFromCookieStore(cookieStore)
    ),
  })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = buildRecoveryAuthSessionFromCookieStore(cookieStore)
  const decision = getRouteAccessDecision(session, 'operator')

  if (!decision.allow) {
    return NextResponse.json(
      { error: 'operator_access_required', redirectTo: decision.redirectTo },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => ({} as { workspaceId?: string }))
  const workspaceId = String(body.workspaceId ?? '').trim()
  const options = listRecoveryWorkspaceOptions()
  const selected = options.find((option) => option.workspaceId === workspaceId)

  if (!selected) {
    return NextResponse.json({ error: 'invalid_workspace_selection' }, { status: 400 })
  }

  const response = NextResponse.json({
    context: resolveRecoveryWorkspaceContext(session, selected.workspaceId),
    options,
  })

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.activeWorkspaceId, selected.workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}