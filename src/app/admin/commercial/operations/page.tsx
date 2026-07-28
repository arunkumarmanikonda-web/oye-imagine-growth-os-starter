import {
  getCommercialAuditEvents,
  listContracts,
  listInvoices,
  listSubscriptions,
} from "@/lib/commercial/store"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminCommercialOperationsPage() {
  const subscriptions = listSubscriptions()
  const contracts = listContracts()
  const invoices = listInvoices()
  const auditEvents = getCommercialAuditEvents().slice(-8).reverse()

  const activeContracts = contracts.filter((item) => item.status === "active").length
  const paidInvoices = invoices.filter((item) => item.status === "paid").length
  const renewedSubscriptions = subscriptions.filter((item) => item.renewedAt !== null).length
  const paidInvoiceTotal = invoices
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.total, 0)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin / Commercial / Operations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Commercial Operations
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Operational controls for contract activation, invoice collection, and
          subscription renewal across the commercial backbone.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active contracts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{activeContracts}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid invoices</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{paidInvoices}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Renewed subscriptions</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{renewedSubscriptions}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid invoice total</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {formatCurrency(paidInvoiceTotal)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Subscriptions</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {subscriptions.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No subscriptions found.</li>
            ) : (
              subscriptions.map((item) => (
                <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.status}</div>
                  <div>{formatCurrency(item.amount)} · renewed: {item.renewedAt ?? "not yet"}</div>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Contracts</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {contracts.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No contracts found.</li>
            ) : (
              contracts.map((item) => (
                <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.contractType}</div>
                  <div>{item.status} · effective: {item.effectiveAt ?? "not active"}</div>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No invoices found.</li>
            ) : (
              invoices.map((item) => (
                <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.invoiceNumber}</div>
                  <div>{item.status} · paid: {item.paidAt ?? "not yet"}</div>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent audit events</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {auditEvents.length === 0 ? (
            <li className="px-5 py-4 text-sm text-slate-500">No audit events found.</li>
          ) : (
            auditEvents.map((item) => (
              <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                <div className="font-medium text-slate-900">{item.action}</div>
                <div>{item.resourceType} · {item.resourceId}</div>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}