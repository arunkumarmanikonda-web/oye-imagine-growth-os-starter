import { buildInvoicePreview, buildLedgerSnapshot } from '@/lib/recovery/commercial-invoicing-foundation'

export default function ClientBillingPage() {
  const invoice = buildInvoicePreview({
    clientLegalName: 'Prospective client',
    requestedLanes: ['growth_strategy', 'performance_marketing'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 100000,
    paymentTerm: 'net_15',
    invoiceSequence: 21,
  })

  const ledger = buildLedgerSnapshot({
    clientLegalName: 'Prospective client',
    requestedLanes: ['growth_strategy', 'performance_marketing'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 100000,
    paymentTerm: 'net_15',
    invoiceSequence: 21,
    openingBalanceInr: 10000,
    receivedPaymentInr: 30000,
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client billing</div>
          <h1 className="text-4xl font-semibold tracking-tight">Invoice truth and ledger visibility</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Clients can review tax invoice totals, delivery metadata and outstanding balance from one governed billing surface.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Invoice preview</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">{invoice.invoiceNumber}</div>
            <div className="mt-2 text-sm text-neutral-600">Taxable value: ₹{invoice.taxSummary.taxableValueInr}</div>
            <div className="mt-2 text-sm text-neutral-600">GST: ₹{invoice.taxSummary.gstAmountInr}</div>
            <div className="mt-2 text-sm text-neutral-600">Total: ₹{invoice.taxSummary.totalInr}</div>
            <div className="mt-2 text-sm text-neutral-600">Due in days: {invoice.billingTerms.dueInDays}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Ledger</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm text-neutral-700">Opening balance: ₹{ledger.openingBalanceInr}</div>
            <div className="mt-2 text-sm text-neutral-700">Invoiced: ₹{ledger.invoicedAmountInr}</div>
            <div className="mt-2 text-sm text-neutral-700">Received: ₹{ledger.receivedPaymentInr}</div>
            <div className="mt-2 text-sm font-semibold text-neutral-950">Outstanding: ₹{ledger.outstandingBalanceInr}</div>
          </div>
        </div>
      </section>
    </div>
  )
}