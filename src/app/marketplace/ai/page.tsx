import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildDemoMarketplaceConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export default function MarketplaceAiPage() {
  const scope = buildDemoMarketplaceConciergeScope()
  const payload = buildConciergeExperiencePayload(
    scope,
    'marketplace_surface',
    'service lanes, proposal status, request status, specialist availability and approved deliverables'
  )

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Marketplace AI</div>
        <h1 className="text-2xl font-semibold">{payload.shell.title}</h1>
        <p className="max-w-3xl text-sm text-neutral-600">{payload.shell.subtitle}</p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Ask anything</div>
        <div className="mt-3 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
          {payload.shell.placeholder}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {payload.shell.promptPresets.map((preset) => (
            <div key={preset.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="font-medium">{preset.label}</div>
              <div className="mt-1 text-sm text-neutral-600">{preset.description}</div>
              <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                {preset.query}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Visible artifacts', payload.snapshot.totalResources],
          ['Open requests', payload.snapshot.openMarketplaceRequests],
          ['Pending approvals', payload.snapshot.pendingApprovals],
          ['Permission scoped', 'Yes'],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-neutral-500">{payload.guidedAnswer.headline}</div>
        <h2 className="mt-2 text-lg font-medium">{payload.guidedAnswer.summary}</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {payload.guidedAnswer.sourceChips.map((chip) => (
            <a
              key={`${chip.kind}-${chip.href}`}
              href={chip.href}
              className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
            >
              {chip.label}
            </a>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {payload.guidedAnswer.actionCards.map((card) => (
            <a
              key={card.id}
              href={card.href}
              className="rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-400"
            >
              <div className="text-xs uppercase tracking-wide text-neutral-500">{card.tone}</div>
              <div className="mt-1 font-medium">{card.label}</div>
              <div className="mt-1 text-sm text-neutral-600">{card.description}</div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}