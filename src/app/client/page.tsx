import Link from 'next/link'
import { getClientAccessState } from '@/lib/client-auth'
import { buildWorkspaceContext } from '@/lib/recovery/workspace-foundation'
import { getCanonicalNeejeeProfile } from '@/lib/recovery/neejee-foundation'

export default async function ClientPage() {
  const accessState = await getClientAccessState()
  const workspaceContext = buildWorkspaceContext({
    role: 'client',
    cookieWorkspaceId: accessState.workspaceSlug ?? undefined,
    allowedWorkspaceIds: ['workspace_neejee_primary'],
  })
  const neejee = getCanonicalNeejeeProfile()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Client workspace</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">Authenticated client access with workspace truth</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          This client surface is now bound to lane-safe authentication, canonical workspace selection, and Neejee brand truth.
        </p>

        <section className="mt-12 grid gap-6 lg:grid-cols-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Authenticated</div>
            <div className="mt-3 text-3xl font-semibold">{accessState.isAuthenticated ? 'yes' : 'no'}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Lane</div>
            <div className="mt-3 text-sm">{accessState.lane}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active workspace</div>
            <div className="mt-3 text-sm">{workspaceContext.activeWorkspaceId}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Actor email</div>
            <div className="mt-3 text-sm">{accessState.email ?? 'not available'}</div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Workspace truth</div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div>Brand: {workspaceContext.activeBrandName}</div>
              <div>Tenant: {workspaceContext.activeTenantId}</div>
              <div>Selection source: {workspaceContext.source}</div>
              <div>Stable selection: {workspaceContext.isStable ? 'yes' : 'no'}</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Canonical client brand</div>
            <div className="mt-4 text-2xl font-semibold">{neejee.brandName}</div>
            <div className="mt-3 text-sm text-slate-300">{neejee.positioning}</div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Contact support
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
