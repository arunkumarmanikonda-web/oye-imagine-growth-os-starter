import { getAdminCommercialDashboardExperience } from '@/lib/recovery/commercial-dashboard-foundation'

export default function AdminCommercialDashboardPage() {
  const experience = getAdminCommercialDashboardExperience()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Commercial dashboard</div>
          <h1 className="text-4xl font-semibold tracking-tight">Client commercial closure and workflow handoff</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            B4 closes the commercial loop with one client-facing dashboard and one operator-facing workflow closure view spanning agreement, invoice, ledger, support and delivery continuity.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Support statuses</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.supportStatusCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Workflow stages</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.workflowStageCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Invoice statuses</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.invoiceStatusCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Ledger entry types</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.ledgerEntryTypeCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Client dashboard summary</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">Agreement</div>
              <div className="mt-2 text-sm text-neutral-600">{experience.dashboard.agreementSummary.agreementId}</div>
              <div className="mt-2 text-sm text-neutral-600">State: {experience.dashboard.agreementSummary.executionState}</div>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">Invoice</div>
              <div className="mt-2 text-sm text-neutral-600">{experience.dashboard.invoiceSummary.invoiceNumber}</div>
              <div className="mt-2 text-sm text-neutral-600">Total: ₹{experience.dashboard.invoiceSummary.totalInr}</div>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">Ledger</div>
              <div className="mt-2 text-sm text-neutral-600">Outstanding: ₹{experience.dashboard.ledgerSummary.outstandingBalanceInr}</div>
              <div className="mt-2 text-sm text-neutral-600">Overdue: {experience.dashboard.ledgerSummary.overdue ? 'true' : 'false'}</div>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">Support</div>
              <div className="mt-2 text-sm text-neutral-600">Threads: {experience.dashboard.supportSummary.activeThreadCount}</div>
              <div className="mt-2 text-sm text-neutral-600">Latest: {experience.dashboard.supportSummary.latestStatus}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Workflow closure</div>
          <div className="mt-5 space-y-4">
            {experience.workflow.stages.map((stage) => (
              <div key={stage.stage} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{stage.label}</div>
                <div className="mt-2 text-sm text-neutral-600">Status: {stage.status}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{stage.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Continuity timeline</div>
          <div className="mt-5 space-y-4">
            {experience.dashboard.continuityTimeline.map((event) => (
              <div key={event.eventId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{event.label}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{event.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Workflow cards</div>
          <div className="mt-5 space-y-4">
            {experience.workflowCards.map((card) => (
              <div key={card.id} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{card.label}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{card.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}