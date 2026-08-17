import Link from 'next/link'
import { requireApiAccess } from '@/lib/auth/api-access'
import { buildWorkspaceContext } from '@/lib/recovery/workspace-foundation'
import { buildNeejeeTruthSnapshot } from '@/lib/recovery/neejee-foundation'

export default async function AdminPage() {
  const access = await requireApiAccess({ lane: 'admin' })
  const workspaceContext = buildWorkspaceContext({
    role: 'operator',
    cookieWorkspaceId: access.membership.workspace_id ?? undefined,
    allowedWorkspaceIds: ['workspace_neejee_primary', 'workspace_oye_internal'],
  })
  const neejeeTruth = buildNeejeeTruthSnapshot()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Operator workspace</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">Protected operator access with verified workspace truth</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">The admin shell is bound to verified identity, admin-lane membership, AAL2 assurance, governed permissions and canonical workspace selection.</p>
        <section className="mt-12 grid gap-6 lg:grid-cols-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Authenticated</div><div className="mt-3 text-3xl font-semibold">yes</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Assurance</div><div className="mt-3 text-sm">{access.assuranceLevel}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active workspace</div><div className="mt-3 text-sm">{workspaceContext.activeWorkspaceId}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Actor email</div><div className="mt-3 text-sm">{access.email ?? 'not available'}</div></div>
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Workspace truth</div><div className="mt-4 space-y-3 text-sm text-slate-300"><div>Brand: {workspaceContext.activeBrandName}</div><div>Tenant: {workspaceContext.activeTenantId}</div><div>Selection source: {workspaceContext.source}</div><div>Stable selection: {workspaceContext.isStable ? 'yes' : 'no'}</div></div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Canonical truth</div><div className="mt-4 space-y-3 text-sm text-slate-300"><div>Source: {neejeeTruth.canonicalTruthSource}</div><div>Support email: {neejeeTruth.supportEmail}</div><div>Deprecated sources removed: {neejeeTruth.deprecatedSources.join(', ')}</div></div></div>
        </section>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/settings" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">Open settings</Link><form action="/api/auth/logout" method="post"><button type="submit" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">Sign out</button></form></div>
      </div>
    </main>
  )
}
