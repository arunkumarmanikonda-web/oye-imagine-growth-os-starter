import Link from 'next/link'
import { getClientCommercialDashboardExperience } from '@/lib/recovery/commercial-operations-foundation'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientCommercialPage() {
  const context = await requireClientSurfaceContext('/client/commercial')

  if (!context.isDemo) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Client commercial</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{context.displayName}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">No fixture-backed commercial dashboard is presented for this production membership. Live documents, balances and commitments appear only when verified workspace records exist for the exact tenant and workspace.</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
              <p>Tenant: {context.membership.tenant_id}</p>
              <p className="mt-2">Workspace: {context.membership.workspace_id}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/client/commercial/remittance" className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-medium text-neutral-950">Media remittance</Link>
              <Link href="/support" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white">Support</Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const experience = getClientCommercialDashboardExperience('Neejee')
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-amber-400/30 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Authenticated demo / Client commercial fixture</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{experience.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{experience.subtitle}</p>
          <p className="mt-3 text-sm text-amber-200">All commercial cards below are fixture data visible only to an explicitly marked demo account.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {experience.summaryCards.map((card) => <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.24em] text-white/50">{card.label}</p><p className="mt-3 text-3xl font-semibold text-white">{card.value}</p></div>)}
          </div>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold">Demo documents</h2>
          <div className="mt-5 space-y-4">
            {experience.documentCards.map((card) => <article key={card.id} className="rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-xs uppercase tracking-[0.24em] text-emerald-300">{card.type}</p><h3 className="mt-2 text-lg font-medium text-white">{card.title}</h3><p className="mt-2 text-sm text-white/65">Status: {card.status}</p><p className="mt-2 text-sm text-white/65">{card.amountLabel}</p></article>)}
          </div>
        </section>
      </div>
    </main>
  )
}
