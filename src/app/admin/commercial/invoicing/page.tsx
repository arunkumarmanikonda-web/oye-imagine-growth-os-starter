import { getAdminCommercialInvoicingExperience } from '@/lib/recovery/commercial-invoicing-foundation'

export default function AdminCommercialInvoicingPage() {
  const experience = getAdminCommercialInvoicingExperience()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Commercial invoicing</div>
          <h1 className="text-4xl font-semibold tracking-tight">GST-aligned invoicing, delivery routing and ledger foundation</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            B3 binds invoice generation to canonical provider identity, prepares delivery through the billing stack and establishes the first governed ledger snapshot.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Invoice statuses</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.invoiceStatusCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Ledger entry types</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.ledgerEntryTypeCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Delivery channels</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.deliveryChannelCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">GST rates</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.gstRateCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Sample tax invoice</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">{experience.sampleInvoice.invoiceNumber}</div>
            <div className="mt-2 text-sm text-neutral-600">GSTIN: {experience.sampleInvoice.metadata.gstin}</div>
            <div className="mt-2 text-sm text-neutral-600">Taxable value: ₹{experience.sampleInvoice.taxSummary.taxableValueInr}</div>
            <div className="mt-2 text-sm text-neutral-600">GST: ₹{experience.sampleInvoice.taxSummary.gstAmountInr}</div>
            <div className="mt-2 text-sm text-neutral-600">Total: ₹{experience.sampleInvoice.taxSummary.totalInr}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Delivery routing</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">{experience.deliveryPlan.subject}</div>
            <div className="mt-2 text-sm text-neutral-600">Primary recipient: {experience.deliveryPlan.primaryRecipient}</div>
            <div className="mt-2 text-sm text-neutral-600">Provider: {experience.deliveryPlan.provider}</div>
            <div className="mt-2 text-sm text-neutral-600">Portal route: {experience.deliveryPlan.portalRoute}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Ledger snapshot</div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">Opening balance: ₹{experience.ledger.openingBalanceInr}</div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">Invoiced amount: ₹{experience.ledger.invoicedAmountInr}</div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">Received payment: ₹{experience.ledger.receivedPaymentInr}</div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">Outstanding balance: ₹{experience.ledger.outstandingBalanceInr}</div>
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