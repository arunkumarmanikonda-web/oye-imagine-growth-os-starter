import Link from 'next/link'
import { getClientFinanceWorkspace } from '@/lib/finance/client-finance'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function ClientFinancePage() {
  const context = await requireClientSurfaceContext('/client/finance')

  if (!context.isDemo) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Client / Finance</p>
          <h1 className="text-3xl font-semibold text-slate-950">{context.displayName} finance workspace</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            No verified live invoice or agreement ledger is attached to this membership on this surface yet. Prototype finance fixtures are intentionally disabled for production client accounts.
          </p>
        </header>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Verified-data boundary</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Tenant: {context.membership.tenant_id}<br />
            Workspace: {context.membership.workspace_id}<br />
            The page will show invoice, agreement and collections values only after they are sourced from a governed workspace record for this exact membership.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/client/commercial/remittance" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Open governed media remittance</Link>
            <Link href="/support" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700">Contact support</Link>
          </div>
        </section>
      </main>
    )
  }

  const workspace = getClientFinanceWorkspace('neejee')

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">Authenticated demo / Finance fixture</p>
        <h1 className="text-3xl font-semibold text-slate-950">{workspace.summary.clientName} demo finance workspace</h1>
        <p className="max-w-3xl text-sm text-slate-600">These invoice and agreement values are fixture data visible only because this membership is explicitly marked as a demo account.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Agreements</p><p className="mt-2 text-3xl font-semibold text-slate-950">{workspace.summary.agreementCount}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Invoices</p><p className="mt-2 text-3xl font-semibold text-slate-950">{workspace.summary.invoiceCount}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total invoiced</p><p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(workspace.summary.totalInvoiced)}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Received</p><p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(workspace.summary.totalReceived)}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Outstanding</p><p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(workspace.summary.outstandingAmount)}</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Demo invoices</h2>
        <div className="mt-4 grid gap-4">
          {workspace.invoices.map((invoice) => (
            <article key={invoice.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{invoice.invoiceNumber}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{invoice.title}</h3><p className="mt-1 text-sm text-slate-600">{invoice.kind} · {invoice.status}</p></div>
                <div className="text-left md:text-right"><p className="text-sm font-semibold text-slate-950">{formatCurrency(invoice.totalAmount)}</p><p className="text-sm text-slate-600">Balance: {formatCurrency(invoice.balanceAmount)}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
