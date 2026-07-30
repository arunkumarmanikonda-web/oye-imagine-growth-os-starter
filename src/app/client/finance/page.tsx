import { getClientFinanceWorkspace } from '@/lib/finance/client-finance'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ClientFinancePage() {
  const workspace = getClientFinanceWorkspace('neejee')

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Client / Finance</p>
        <h1 className="text-3xl font-semibold text-slate-950">{workspace.summary.clientName} finance workspace</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Agreement-linked billing visibility, GST mode tracking, invoice state, outstanding balances, and collections
          status from one client-facing workspace.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Agreements</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{workspace.summary.agreementCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{workspace.summary.invoiceCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total invoiced</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(workspace.summary.totalInvoiced)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Received</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(workspace.summary.totalReceived)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Outstanding</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(workspace.summary.outstandingAmount)}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">Invoices</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                GST modes: {workspace.gstModes.join(', ') || 'n/a'}
              </span>
            </div>

            <div className="grid gap-4">
              {workspace.invoices.map((invoice) => (
                <article key={invoice.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{invoice.invoiceNumber}</p>
                      <h3 className="text-lg font-semibold text-slate-950">{invoice.title}</h3>
                      <p className="text-sm text-slate-600">
                        {invoice.kind} · {invoice.status}
                      </p>
                      {invoice.sourceAgreementNumber ? (
                        <p className="text-xs text-slate-500">Agreement link: {invoice.sourceAgreementNumber}</p>
                      ) : null}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold text-slate-950">{formatCurrency(invoice.totalAmount)}</p>
                      <p className="text-sm text-slate-600">Balance: {formatCurrency(invoice.balanceAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">GST mode: {invoice.gstMode}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      issue ready: {invoice.readiness.issueReady ? 'yes' : 'no'}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      payment ready: {invoice.readiness.paymentReady ? 'yes' : 'no'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Payment timeline</h2>
            <div className="mt-4 grid gap-3">
              {workspace.paymentTimeline.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{entry.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{entry.kind}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-slate-700">{entry.date.slice(0, 10)}</p>
                      {typeof entry.amount === 'number' ? (
                        <p className="text-xs text-slate-500">{formatCurrency(entry.amount)}</p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Collections alerts</h2>
            <div className="mt-4 grid gap-3">
              {workspace.collectionsAlerts.length === 0 ? (
                <p className="text-sm text-slate-600">No collections alerts for this workspace.</p>
              ) : (
                workspace.collectionsAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{alert.severity}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{alert.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {alert.invoiceNumber} · due {alert.dueDate.slice(0, 10)} · {formatCurrency(alert.amount)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Related agreements</h2>
            <div className="mt-4 grid gap-3">
              {workspace.agreements.map((agreement) => (
                <article key={agreement.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{agreement.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {agreement.agreementNumber} · {agreement.status}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}