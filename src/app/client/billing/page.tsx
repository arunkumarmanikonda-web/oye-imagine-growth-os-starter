import Link from 'next/link'
import { buildInvoicePreview, buildLedgerSnapshot } from '@/lib/recovery/commercial-invoicing-foundation'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientBillingPage() {
  const context = await requireClientSurfaceContext('/client/billing')

  if (!context.isDemo) {
    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client billing</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Verified billing records for {context.displayName}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">No verified live invoice or ledger entry is attached to this membership on this page yet. Synthetic invoice numbers, balances and tax amounts are not presented as production client state.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/client/finance" className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Open finance boundary</Link><Link href="/support" className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium">Billing support</Link></div>
        </section>
      </div>
    )
  }

  const invoice = buildInvoicePreview({clientLegalName:'Demo client',requestedLanes:['growth_strategy','performance_marketing'],billingModel:'monthly_retainer',baseFeeInr:100000,paymentTerm:'net_15',invoiceSequence:21})
  const ledger = buildLedgerSnapshot({clientLegalName:'Demo client',requestedLanes:['growth_strategy','performance_marketing'],billingModel:'monthly_retainer',baseFeeInr:100000,paymentTerm:'net_15',invoiceSequence:21,openingBalanceInr:10000,receivedPaymentInr:30000})

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-amber-300 bg-white px-8 py-10 shadow-sm"><div className="text-xs uppercase tracking-[0.35em] text-amber-600">Authenticated demo / Billing fixture</div><h1 className="mt-4 text-4xl font-semibold tracking-tight">Invoice and ledger example</h1><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">These invoice and balance values are labelled demo data and are not production billing records.</p></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"><div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Demo invoice</div><div className="mt-5 rounded-2xl bg-neutral-50 p-4"><div className="text-sm font-semibold">{invoice.invoiceNumber}</div><div className="mt-2 text-sm text-neutral-600">Taxable value: ₹{invoice.taxSummary.taxableValueInr}</div><div className="mt-2 text-sm text-neutral-600">GST: ₹{invoice.taxSummary.gstAmountInr}</div><div className="mt-2 text-sm text-neutral-600">Total: ₹{invoice.taxSummary.totalInr}</div></div></div><div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"><div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Demo ledger</div><div className="mt-5 rounded-2xl bg-neutral-50 p-4"><div className="text-sm text-neutral-700">Opening balance: ₹{ledger.openingBalanceInr}</div><div className="mt-2 text-sm text-neutral-700">Invoiced: ₹{ledger.invoicedAmountInr}</div><div className="mt-2 text-sm text-neutral-700">Received: ₹{ledger.receivedPaymentInr}</div><div className="mt-2 text-sm font-semibold text-neutral-950">Outstanding: ₹{ledger.outstandingBalanceInr}</div></div></div></section>
    </div>
  )
}
