import Link from 'next/link'
import { getClientPaymentCommitmentExperience } from '@/lib/recovery/commercial-collections-foundation'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientCommercialPaymentsPage() {
  const context = await requireClientSurfaceContext('/client/commercial/payments')

  if (!context.isDemo) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Client payments</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Verified payment state only</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">No payment promise, invoice balance or collections commitment is displayed until it is backed by a governed record for {context.displayName}. Prototype payment commitments are disabled for production memberships.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/client/commercial/remittance" className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-medium text-neutral-950">Media remittance</Link>
              <Link href="/support" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white">Support</Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const experience = getClientPaymentCommitmentExperience('Neejee')
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-3xl border border-amber-400/30 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Authenticated demo / Payment commitment fixture</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{experience.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{experience.subtitle}</p>
          <p className="mt-3 text-sm text-amber-200">The commitments below are fixture data and are not production payment records.</p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold">Demo commitments</h2>
          <div className="mt-5 space-y-4">
            {experience.commitments.map((commitment) => <article key={commitment.id} className="rounded-2xl border border-white/10 bg-black/20 p-5"><h3 className="text-lg font-medium text-white">{commitment.invoiceNumber}</h3><p className="mt-2 text-sm text-white/65">Amount: ₹{commitment.amountInr.toLocaleString('en-IN')}</p><p className="mt-2 text-sm text-white/65">Promised date: {commitment.promisedDate}</p><p className="mt-2 text-sm text-white/65">Status: {commitment.status}</p></article>)}
          </div>
        </section>
      </div>
    </main>
  )
}
