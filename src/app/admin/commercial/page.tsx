import { buildCommercialAutomationJobs, getCommercialAutomationSummary } from '@/lib/commercial/commercial-automation'
import { getCommercialHardeningSnapshot } from '@/lib/commercial/commercial-hardening'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminCommercialPage() {
  const referenceDate = '2026-08-05T00:00:00.000Z'
  const snapshot = getCommercialHardeningSnapshot(referenceDate)
  const summary = getCommercialAutomationSummary('all', referenceDate)
  const jobs = buildCommercialAutomationJobs('all', referenceDate)

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Admin / Commercial</p>
        <h1 className="text-3xl font-semibold text-slate-950">Commercial automations and hardening</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Commercial follow-ups, collections routing, renewal nudges, and readiness checks across agreements,
          invoices, and client finance surfaces.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Automation jobs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{snapshot.totalAutomationJobs}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Critical jobs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{snapshot.criticalAutomationJobs}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open collections</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(snapshot.openCollectionsValue)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Readiness score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{snapshot.readinessScore}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Workspaces</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{snapshot.workspacesCovered.length}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">Automation queue</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                workspaces: {summary.workspaces.join(', ')}
              </span>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{job.kind}</p>
                      <h3 className="text-lg font-semibold text-slate-950">{job.title}</h3>
                      <p className="text-sm text-slate-600">{job.description}</p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{job.priority}</p>
                      <p className="text-sm text-slate-700">{job.channel}</p>
                      <p className="text-xs text-slate-500">{job.scheduledFor.slice(0, 10)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{job.workspaceKey}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{job.targetReference}</span>
                    {typeof job.amount === 'number' ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        {formatCurrency(job.amount)}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Hardening checks</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.checks.map((check) => (
                <article key={check.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-950">{check.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {check.passed ? 'pass' : 'fail'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{check.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Automation mix</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              {Object.entries(summary.byKind).map(([kind, count]) => (
                <div key={kind} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <span className="uppercase tracking-[0.18em] text-slate-500">{kind}</span>
                  <span className="font-semibold text-slate-950">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">At-risk workspaces</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {snapshot.atRiskWorkspaces.length === 0 ? (
                <p className="text-sm text-slate-600">No high-risk workspaces right now.</p>
              ) : (
                snapshot.atRiskWorkspaces.map((workspace) => (
                  <span
                    key={workspace}
                    className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                  >
                    {workspace}
                  </span>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}