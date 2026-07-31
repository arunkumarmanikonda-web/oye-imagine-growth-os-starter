import Link from 'next/link'
import { getClientAccessState } from '@/lib/client-auth'
import { buildWorkspaceContext } from '@/lib/recovery/workspace-foundation'
import { getCanonicalNeejeeProfile } from '@/lib/recovery/neejee-foundation'

export default async function ClientPage() {
  const accessState = await getClientAccessState()
  const workspaceContext = buildWorkspaceContext({
    role: 'client',
    allowedWorkspaceIds: ['workspace_neejee_primary'],
  })
  const neejee = getCanonicalNeejeeProfile()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Client workspace foundation</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">Client dashboard route foundation</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          This route now aligns client access with a canonical workspace resolver and Neejee truth foundation.
        </p>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Authenticated</div>
            <div className="mt-3 text-3xl font-semibold">{accessState.isAuthenticated ? 'yes' : 'no'}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active workspace</div>
            <div className="mt-3 text-sm">{workspaceContext.activeWorkspaceId}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Selection source</div>
            <div className="mt-3 text-sm">{workspaceContext.source}</div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Canonical client brand</div>
            <div className="mt-4 text-2xl font-semibold">{neejee.brandName}</div>
            <div className="mt-3 text-sm text-slate-300">{neejee.positioning}</div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Immediate next stage</div>
            <div className="mt-4 text-sm leading-7 text-slate-300">
              The next Mega Batch A pass will replace placeholder truth dependencies with live canonical workspace and pilot resolution across operator and client surfaces.
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/login/client" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Back to client login
          </Link>
        </div>
      </div>
    </main>
  )
}