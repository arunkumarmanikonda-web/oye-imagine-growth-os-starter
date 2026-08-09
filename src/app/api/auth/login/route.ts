import { NextRequest, NextResponse } from 'next/server'
import { buildAuthCookieRecord, createLoginRedirectPath } from '@/lib/auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY, resolveWorkspaceSelection } from '@/lib/recovery/workspace-foundation'
import { createRecoverySessionPayload } from '@/lib/recovery/auth-session'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'

function normalizeLane(value: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'admin' || normalized === 'operator' ? 'admin' : 'client'
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const lane = normalizeLane(String(formData.get('lane') ?? formData.get('role') ?? ''))
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const displayName = String(formData.get('displayName') ?? '').trim()
  const requestedWorkspaceIdRaw = String(formData.get('workspaceSlug') ?? '').trim()
  const requestedWorkspaceId =
    requestedWorkspaceIdRaw ||
    (lane === 'admin' ? 'workspace_oye_internal' : 'workspace_neejee_primary')
  const redirectInput = String(formData.get('redirectTo') ?? formData.get('redirect') ?? '').trim()

  const loginRoute = lane === 'admin' ? '/login/admin' : '/login/client'
  if (!email) {
    return NextResponse.redirect(new URL(loginRoute, request.url))
  }

  const workspaceSelection = resolveWorkspaceSelection({
    role: lane === 'admin' ? 'operator' : 'client',
    requestedWorkspaceId,
    allowedWorkspaceIds:
      lane === 'admin'
        ? ['workspace_oye_internal', 'workspace_neejee_primary']
        : ['workspace_neejee_primary'],
  })

  const cookieRecord = buildAuthCookieRecord({
    lane,
    email,
    workspaceSlug: workspaceSelection.workspace.workspaceId,
    tenantSlug: workspaceSelection.workspace.tenantId,
    brandSlug: workspaceSelection.workspace.brandId,
  })

  const recoveryPayload = createRecoverySessionPayload({
    email,
    role: lane === 'admin' ? 'operator' : 'client',
    displayName,
  })

  const destination = createLoginRedirectPath(lane, redirectInput)
  const response = NextResponse.redirect(new URL(destination, request.url))

  Object.entries(cookieRecord).forEach(([key, value]) => {
    response.cookies.set(key, value, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  })

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.sessionId, recoveryPayload.sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.role, recoveryPayload.role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.email, recoveryPayload.email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(RECOVERY_AUTH_COOKIE_KEYS.displayName, recoveryPayload.displayName, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(ACTIVE_WORKSPACE_COOKIE_KEY, workspaceSelection.workspace.workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}