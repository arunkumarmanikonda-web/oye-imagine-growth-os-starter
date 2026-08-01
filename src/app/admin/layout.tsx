import type { Route } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { buildRecoveryAuthSessionFromCookieStore, getSelectedWorkspaceIdFromCookieStore } from '@/lib/recovery/auth-session-server'
import { getRouteAccessDecision } from '@/lib/recovery/route-guards'
import { resolveRecoveryWorkspaceContext } from '@/lib/recovery/workspace-context'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const session = buildRecoveryAuthSessionFromCookieStore(cookieStore)
  const decision = getRouteAccessDecision(session, 'operator')

  if (!decision.allow && decision.redirectTo) {
    redirect(decision.redirectTo as Route)
  }

  const workspaceContext = resolveRecoveryWorkspaceContext(
    session,
    getSelectedWorkspaceIdFromCookieStore(cookieStore)
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Operator shell</div>
            <div className="text-sm font-medium text-neutral-950">{workspaceContext.label}</div>
            <div className="text-xs text-neutral-500">{workspaceContext.description}</div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  )
}