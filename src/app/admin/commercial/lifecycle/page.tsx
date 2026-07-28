import {
  listContracts,
  listInvoices,
  listLedgerEntries,
  listSubscriptions,
} from "@/lib/commercial/store"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminCommercialLifecyclePage() {
  const subscriptions = listSubscriptions()
  const contracts = listContracts()
  const invoices = listInvoices()
  const ledgerEntries = listLedgerEntries()

  const issuedInvoiceTotal = invoices
    .filter((item) => item.status === "issued")
    .reduce((sum, item) => sum + item.total, 0)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin / Commercial / Lifecycle
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Commercial Lifecycle
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Operational view of subscriptions, contracts, invoices, and ledger
          activity for the commercial backbone slice.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Subscriptions</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{subscriptions.length}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Contracts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{contracts.length}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{invoices.length}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Issued invoice total</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {formatCurrency(issuedInvoiceTotal)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
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
                  <div>{formatCurrency(item.amount)} · {item.currency}</div>
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
                  <div>{item.status}</div>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
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
                  <div>{item.status} · {formatCurrency(item.total)}</div>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Ledger</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {ledgerEntries.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No ledger entries found.</li>
            ) : (
              ledgerEntries.map((item) => (
                <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.reason}</div>
                  <div>{item.direction} · {formatCurrency(item.amount)}</div>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </main>
  )
}