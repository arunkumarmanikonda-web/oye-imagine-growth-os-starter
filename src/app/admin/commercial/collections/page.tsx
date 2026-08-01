import { getInvoiceDispatchExperience } from '../../../../lib/recovery/commercial-collections-foundation'

export default function AdminCommercialCollectionsPage() {
  const experience = getInvoiceDispatchExperience()

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Commercial collections</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{experience.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{experience.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {experience.counts && [
              { label: 'Total invoices', value: String(experience.counts.totalInvoices) },
              { label: 'Dispatched', value: String(experience.counts.dispatchedInvoices) },
              { label: 'Resends', value: String(experience.counts.resendEvents) },
              { label: 'Draft held', value: String(experience.counts.draftHeldInvoices) }
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold">Dispatch items</h2>
          <div className="mt-5 space-y-4">
            {experience.items.map((item) => (
              <article key={item.invoiceId} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.invoiceNumber}</h3>
                    <p className="mt-2 text-sm text-white/65">{item.accountName}</p>
                    <p className="mt-2 text-sm text-white/65">{item.nextAction}</p>
                  </div>
                  <div className="text-right text-sm text-white/75">
                    <p>Status: {item.status}</p>
                    <p>Dispatches: {item.dispatchCount}</p>
                    <p>Resends: {item.resendCount}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}