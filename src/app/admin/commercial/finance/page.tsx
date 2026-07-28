import {
  listLedgerEntries,
  listMediaBalanceAccounts,
} from "@/lib/commercial/store"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminCommercialFinancePage() {
  const accounts = listMediaBalanceAccounts()
  const ledgerEntries = listLedgerEntries().slice(-10).reverse()

  const totalAvailable = accounts.reduce((sum, item) => sum + item.availableBalance, 0)
  const totalReserved = accounts.reduce((sum, item) => sum + item.reservedBalance, 0)
  const totalDebits = ledgerEntries
    .filter((item) => item.direction === "debit")
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin / Commercial / Finance
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Commercial Finance Controls
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Reserve and release visibility for tenant media balances, along with recent ledger activity.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available balance</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {formatCurrency(totalAvailable)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reserved balance</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {formatCurrency(totalReserved)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Recent debits</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">
            {formatCurrency(totalDebits)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Media balance accounts</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {accounts.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No media balance accounts found.</li>
            ) : (
              accounts.map((item) => (
                <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.tenantId}</div>
                  <div>available: {formatCurrency(item.availableBalance)}</div>
                  <div>reserved: {formatCurrency(item.reservedBalance)}</div>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent ledger entries</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {ledgerEntries.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No ledger entries found.</li>
            ) : (
              ledgerEntries.map((item) => (
                <li key={item.id} className="px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.reason}</div>
                  <div>{item.direction} · {formatCurrency(item.amount)}</div>
                  <div className="text-xs text-slate-500">{item.source}</div>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </main>
  )
}