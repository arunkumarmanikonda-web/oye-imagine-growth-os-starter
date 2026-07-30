import { buildClientCommercialDashboard } from '@/lib/recovery/commercial-dashboard-foundation'

export default function ClientCommercialPage() {
  const dashboard = buildClientCommercialDashboard({
    clientLegalName: 'Prospective client',
    requestedLanes: ['growth_strategy', 'performance_marketing'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 100000,
    paymentTerm: 'net_15',
    invoiceSequence: 31,
    openingBalanceInr: 10000,
    receivedPaymentInr: 30000,
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Commercial dashboard</div>
          <h1 className="text-4xl font-semibold tracking-tight">Agreement, invoice, ledger and support in one place</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Clients can follow agreement continuity, invoice truth, ledger balance and support status from one governed dashboard.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Agreement state</div>
          <div className="mt-3 text-lg font-semibold">{dashboard.agreementSummary.executionState}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Invoice total</div>
          <div className="mt-3 text-lg font-semibold">₹{dashboard.invoiceSummary.totalInr}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Outstanding</div>
          <div className="mt-3 text-lg font-semibold">₹{dashboard.ledgerSummary.outstandingBalanceInr}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Support threads</div>
          <div className="mt-3 text-lg font-semibold">{dashboard.supportSummary.activeThreadCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Action center</div>
          <div className="mt-5 grid gap-4">
            {dashboard.actionCenter.map((action) => (
              <div key={action.actionId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{action.label}</div>
                <div className="mt-2 text-sm text-neutral-600">{action.route}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Support continuity</div>
          <div className="mt-5 space-y-4">
            {dashboard.supportSummary.threads.map((thread) => (
              <div key={thread.threadId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{thread.subject}</div>
                <div className="mt-2 text-sm text-neutral-600">Status: {thread.status}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{thread.lastMessagePreview}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}