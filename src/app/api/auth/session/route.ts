import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authCookieKeys, resolveAuthSessionFromCookieMap } from '@/lib/auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY } from '@/lib/recovery/workspace-foundation'

export async function GET() {
  const cookieStore = await cookies()
  const session = resolveAuthSessionFromCookieMap({
    [authCookieKeys.lane]: cookieStore.get(authCookieKeys.lane)?.value,
    [authCookieKeys.email]: cookieStore.get(authCookieKeys.email)?.value,
    [authCookieKeys.workspaceSlug]: cookieStore.get(authCookieKeys.workspaceSlug)?.value,
    [authCookieKeys.tenantSlug]: cookieStore.get(authCookieKeys.tenantSlug)?.value,
    [authCookieKeys.brandSlug]: cookieStore.get(authCookieKeys.brandSlug)?.value,
    [authCookieKeys.issuedAt]: cookieStore.get(authCookieKeys.issuedAt)?.value,
  })

  return NextResponse.json({
    session,
    activeWorkspaceId: cookieStore.get(ACTIVE_WORKSPACE_COOKIE_KEY)?.value ?? session.workspaceSlug ?? null,
  })
}
