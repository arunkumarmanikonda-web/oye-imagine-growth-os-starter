import { NextRequest, NextResponse } from 'next/server'

import { resolveRuntimeAccess } from './src/lib/recovery/runtime-enforcement-foundation'

function normalizeRoleCookie(value?: string) {
  if (value === 'client' || value === 'admin') {
    return value
  }

  return 'public'
}

export function middleware(request: NextRequest) {
  const sessionState = request.cookies.get('oye_session_state')?.value
  const workspaceId = request.cookies.get('oye_workspace_id')?.value ?? null
  const role = normalizeRoleCookie(request.cookies.get('oye_active_role')?.value)

  const decision = resolveRuntimeAccess({
    pathname: request.nextUrl.pathname,
    role,
    isAuthenticated: sessionState === 'authenticated',
    workspaceId
  })

  if (!decision.allow && decision.redirectTo) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = decision.redirectTo
    redirectUrl.search = ''

    if (decision.redirectPath) {
      redirectUrl.searchParams.set('redirect', decision.redirectPath)
    }

    if (decision.errorCode) {
      redirectUrl.searchParams.set('error', decision.errorCode)
    }

    return NextResponse.redirect(redirectUrl)
  }

  const response = NextResponse.next()
  response.headers.set('x-oye-batch-a-surface', decision.surface)
  response.headers.set('x-oye-batch-a-runtime', decision.reason)
  return response
}

export const config = {
  matcher: ['/client/:path*', '/admin/:path*']
}