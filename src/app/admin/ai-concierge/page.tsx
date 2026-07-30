import { buildAiConciergeResponse } from '@/lib/ai/concierge-engine'
import { getAiConciergeRegistrySummary, getAiConciergeWorkspaceCards } from '@/lib/ai/concierge-registry'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminAiConciergePage() {
  const summary = getAiConciergeRegistrySummary()
  const workspaces = getAiConciergeWorkspaceCards('2026-08-05T00:00:00.000Z')
  const sample = buildAiConciergeResponse({
    workspaceKey: 'rocketboys',
    surface: 'admin',
    message: 'Who needs payment follow-up first',
    referenceDate: '2026-08-05T00:00:00.000Z',
  })

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Admin / AI Concierge</p>
        <h1 className="text-3xl font-semibold text-slate-950">AI concierge foundation</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Workspace-aware intent routing, response scaffolding, prompt presets, and admin oversight for the client and
          operator concierge layer.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Workspaces</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.workspaces}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Prompt presets</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.promptPresets}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Intent types</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.intents}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Workspace cards</h2>
            <div className="mt-4 grid gap-3">
              {workspaces.map((workspace) => (
                <article key={workspace.workspaceKey} className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-950">{workspace.clientName}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{workspace.workspaceKey}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {workspace.agreementCount} agreement(s), {workspace.invoiceCount} invoice(s), {workspace.openCollectionCount} open collection lane(s)
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Outstanding: {formatCurrency(workspace.outstandingAmount)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Sample routed response</h2>
            <div className="mt-4 rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">{sample.headline}</p>
              <p className="mt-2 text-sm text-slate-600">{sample.summary}</p>
              <div className="mt-4 grid gap-2">
                {sample.insights.map((insight) => (
                  <div key={insight.id} className="rounded-lg border border-slate-200 px-3 py-2">
                    <p className="text-sm font-medium text-slate-950">{insight.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{insight.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}