import { getPaidMediaGovernanceExperience } from "@/lib/recovery/paid-media-governance-foundation";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminCommercialMarketingGovernancePage() {
  const experience = getPaidMediaGovernanceExperience();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mega Batch D2</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{experience.title}</h1>
        <p className="max-w-4xl text-sm leading-6 text-slate-600">{experience.subtitle}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available balance</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{formatCurrency(experience.summary.totalAvailableBalance)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reserved balance</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{formatCurrency(experience.summary.totalReservedBalance)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending approvals</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{experience.summary.pendingApprovalCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Legal review required</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{experience.summary.legalReviewRequired ? "Yes" : "No"}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Creative governance draft</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <div><span className="font-semibold">Platform:</span> {experience.creativeDraft.platform}</div>
              <div><span className="font-semibold">Objective:</span> {experience.creativeDraft.objective}</div>
              <div><span className="font-semibold">Compliance flags:</span> {experience.creativeDraft.complianceFlags.join(", ")}</div>
              <div><span className="font-semibold">Disclaimer:</span> {experience.creativeDraft.disclaimer}</div>
            </div>
            <div className="space-y-3">
              {experience.creativeDraft.assets.map((asset) => (
                <div key={asset.hook + asset.format} className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">{asset.format} · {asset.aspectRatio}</div>
                  <div className="mt-2 text-sm text-slate-600">{asset.hook}</div>
                  <div className="mt-2 text-sm text-slate-700">{asset.headline}</div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Governance checklist</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {experience.governanceChecklist.map((item) => (
              <li key={item} className="rounded-xl bg-slate-50 px-4 py-3">{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Media accounts</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {experience.accounts.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">{item.tenantId}</div>
                <div>Available: {formatCurrency(item.availableBalance)}</div>
                <div>Reserved: {formatCurrency(item.reservedBalance)}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Pending approvals</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {experience.pendingApprovals.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4">No pending approvals.</div>
            ) : (
              experience.pendingApprovals.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{item.actionType}</div>
                  <div>Status: {item.status}</div>
                  <div>Requested by: {item.requestedByUserId}</div>
                  <div>Amount: {formatCurrency(item.payload.amount)}</div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent ledger</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {experience.ledgerEntries.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">{item.reason}</div>
                <div>{item.direction} · {formatCurrency(item.amount)}</div>
                <div className="text-xs text-slate-500">{item.source}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
