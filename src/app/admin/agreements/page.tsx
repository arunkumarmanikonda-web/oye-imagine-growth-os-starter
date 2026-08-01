import { getAgreementTemplates } from '@/lib/agreements/agreement-templates'
import { getAgreementRegistrySummary, getAgreementSummaryCards } from '@/lib/agreements/agreement-registry'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminAgreementsPage() {
  const summary = getAgreementRegistrySummary()
  const cards = getAgreementSummaryCards()
  const templates = getAgreementTemplates()

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Admin / Agreements</p>
        <h1 className="text-3xl font-semibold text-slate-950">Agreement system foundation</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Agreement templates, draft registry, approval readiness, and issue/sign lifecycle now sit behind an admin
          control surface.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total agreements</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.total}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Templates</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.templates}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expiring soon</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.expiringSoon}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Issued / signed</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {summary.byStatus.issued + summary.byStatus.signed}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">Agreement registry</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              CMS / Admin controlled
            </span>
          </div>

          <div className="grid gap-4">
            {cards.map((card) => (
              <article key={card.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {card.agreementNumber}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                    <p className="text-sm text-slate-600">
                      {card.clientName} · {card.workspaceKey} · {card.kind}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-medium text-slate-950">{formatCurrency(card.totalAmount)}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.status}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    issue ready: {card.readiness.issueReady ? 'yes' : 'no'}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                    sign ready: {card.readiness.signReady ? 'yes' : 'no'}
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    expires: {card.expiresAt.slice(0, 10)}
                  </span>
                </div>

                {card.readiness.missing.length > 0 ? (
                  <p className="mt-3 text-xs text-slate-500">Missing: {card.readiness.missing.join(', ')}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Template registry</h2>
            <div className="mt-4 space-y-3">
              {templates.map((template) => (
                <article key={template.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-950">{template.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{template.kind}</p>
                  <p className="mt-2 text-sm text-slate-600">{template.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Status mix</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              {Object.entries(summary.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <span className="uppercase tracking-[0.18em] text-slate-500">{status}</span>
                  <span className="font-semibold text-slate-950">{count}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}