import type { Route } from 'next'
import Link from 'next/link'
import { getOperatorDashboardExperience } from '@/lib/recovery/operator-foundation'
import { buildWorkspaceContext } from '@/lib/recovery/workspace-foundation'
import { buildNeejeeTruthSnapshot } from '@/lib/recovery/neejee-foundation'

export default function AdminPage() {
  const experience = getOperatorDashboardExperience()
  const workspaceContext = buildWorkspaceContext({
    role: 'operator',
    allowedWorkspaceIds: ['workspace_neejee_primary', 'workspace_oye_internal'],
  })
  const neejeeTruth = buildNeejeeTruthSnapshot()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <div>
            <div className="text-lg font-semibold">{experience.title}</div>
            <div className="text-sm text-slate-300">{experience.subtitle}</div>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
            <Link href="/admin" className="hover:text-white">Overview</Link>
            <Link href="/admin/content" className="hover:text-white">Content studio</Link>
            <Link href="/admin/config" className="hover:text-white">Config</Link>
            <Link href="/login" className="hover:text-white">Access hub</Link>
          </nav>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.subtitle}</div>
            <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{experience.subtitle}</p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {experience.cards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href as Route}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/30"
                >
                  <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">{card.title}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{card.description}</p>
                </Link>
              ))}
            </div>

            <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Workspace resolver foundation</div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active workspace</div>
                  <div className="mt-2 text-sm">{workspaceContext.activeWorkspaceId}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Selection source</div>
                  <div className="mt-2 text-sm">{workspaceContext.source}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Brand</div>
                  <div className="mt-2 text-sm">{workspaceContext.activeBrandName}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Stable selection</div>
                  <div className="mt-2 text-sm">{workspaceContext.isStable ? 'yes' : 'no'}</div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Trust block</div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Legal name</div>
                  <div className="mt-2 text-lg font-medium">{experience.trustBlock.legalName}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">GSTIN</div>
                  <div className="mt-2 text-sm">{experience.trustBlock.gstin}</div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Neejee truth foundation</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Canonical source</div>
                  <div className="mt-2 text-sm">{neejeeTruth.canonicalTruthSource}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Deprecated live sources removed next</div>
                  <div className="mt-2 text-sm">{neejeeTruth.deprecatedSources.join(', ')}</div>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}