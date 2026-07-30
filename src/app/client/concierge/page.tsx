import { buildAiConciergeResponse } from '@/lib/ai/concierge-engine'
import { getAiConciergePromptPresets } from '@/lib/ai/concierge-registry'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ClientConciergePage() {
  const response = buildAiConciergeResponse({
    workspaceKey: 'neejee',
    surface: 'client',
    message: 'Show my outstanding invoices and next actions',
    referenceDate: '2026-08-05T00:00:00.000Z',
  })

  const presets = getAiConciergePromptPresets('neejee')

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Client / AI Concierge</p>
        <h1 className="text-3xl font-semibold text-slate-950">{response.headline}</h1>
        <p className="max-w-3xl text-sm text-slate-600">{response.summary}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{response.context.invoiceCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Agreements</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{response.context.agreementCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invoiced</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(response.context.totalInvoiced)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Outstanding</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(response.context.outstandingAmount)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Automation jobs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{response.context.automationJobCount}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Concierge insights</h2>
            <div className="mt-4 grid gap-3">
              {response.insights.map((insight) => (
                <article key={insight.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-950">{insight.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{insight.tone}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{insight.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Suggested prompts</h2>
            <div className="mt-4 grid gap-3">
              {presets.map((preset) => (
                <article key={preset.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{preset.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{preset.intent}</p>
                  <p className="mt-2 text-sm text-slate-600">{preset.prompt}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Recommended actions</h2>
            <div className="mt-4 grid gap-3">
              {response.actions.map((action) => (
                <article key={action.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{action.label}</p>
                  <p className="mt-2 text-sm text-slate-600">{action.reason}</p>
                  <p className="mt-2 text-xs text-slate-500">{action.href}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Follow-up prompts</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {response.suggestedPrompts.map((prompt) => (
                <span
                  key={prompt}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {prompt}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}