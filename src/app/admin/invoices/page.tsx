import { getInvoiceRegistrySummary, getInvoiceSummaryCards } from '@/lib/invoicing/invoice-registry'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminInvoicesPage() {
  const summary = getInvoiceRegistrySummary()
  const cards = getInvoiceSummaryCards()

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Admin / Invoices</p>
        <h1 className="text-3xl font-semibold text-slate-950">Invoicing and GST linkage</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          GST-aware invoice registry, agreement linkage, payment state, and billing visibility behind an admin surface.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total invoices</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.total}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Issued value</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(summary.issuedValue)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Outstanding</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(summary.outstandingValue)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overdue count</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.overdueCount}</p>
        </article>
      </section>

      <section className="grid gap-4">
        {cards.map((card) => (
          <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{card.invoiceNumber}</p>
                <h2 className="text-xl font-semibold text-slate-950">{card.title}</h2>
                <p className="text-sm text-slate-600">
                  {card.clientName} · {card.workspaceKey} · {card.kind}
                </p>
                {card.sourceAgreementNumber ? (
                  <p className="text-xs text-slate-500">Agreement link: {card.sourceAgreementNumber}</p>
                ) : null}
              </div>

              <div className="space-y-1 text-left md:text-right">
                <p className="text-lg font-semibold text-slate-950">{formatCurrency(card.totalAmount)}</p>
                <p className="text-sm text-slate-600">Balance: {formatCurrency(card.balanceAmount)}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.status}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">GST mode: {card.gstMode}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                issue ready: {card.readiness.issueReady ? 'yes' : 'no'}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                payment ready: {card.readiness.paymentReady ? 'yes' : 'no'}
              </span>
            </div>

            {card.readiness.missing.length > 0 ? (
              <p className="mt-3 text-xs text-slate-500">Missing: {card.readiness.missing.join(', ')}</p>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  )
}