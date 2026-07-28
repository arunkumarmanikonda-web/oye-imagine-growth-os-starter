import {
  getCommercialOverview,
  listPendingApprovalRequests,
} from "@/lib/commercial/store"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminCommercialPage() {
  const overview = getCommercialOverview()
  const pendingApprovals = listPendingApprovalRequests()

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin / Commercial
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Commercial Backbone
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Tenant-level overview of subscriptions, contracts, media balance, and
          approval-gated commercial actions for the current pilot backbone.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tenants</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {overview.tenantCount}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending approvals</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {overview.pendingApprovalCount}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available media balance</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {formatCurrency(overview.totalMediaBalanceAvailable)}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Tenant overview</h2>
        </div>

        {overview.tenants.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            No tenant commercial records available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Tenant</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Plan</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Subscription</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Contract</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Media balance</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Pending approvals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {overview.tenants.map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{tenant.name}</div>
                      <div className="text-xs text-slate-500">{tenant.slug}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{tenant.planCode ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-700">{tenant.subscriptionStatus}</td>
                    <td className="px-5 py-4 text-slate-700">{tenant.contractStatus}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatCurrency(tenant.mediaBalanceAvailable)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{tenant.pendingApprovalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Approval queue</h2>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            No pending approval requests.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingApprovals.map((item) => (
              <li key={item.id} className="px-5 py-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-slate-900">
                    {item.actionType} · {formatCurrency(item.payload.amount)}
                  </div>
                  <div className="text-sm text-slate-600">{item.payload.reason}</div>
                  <div className="text-xs text-slate-500">
                    Requested by {item.requestedByUserId} · {item.status}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}