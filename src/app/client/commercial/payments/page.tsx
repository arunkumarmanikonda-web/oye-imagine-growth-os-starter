import { getClientPaymentCommitmentExperience } from '../../../../lib/recovery/commercial-collections-foundation'

export default function ClientCommercialPaymentsPage() {
  const experience = getClientPaymentCommitmentExperience('Neejee')

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Client payments</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{experience.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{experience.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {experience.summaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Commitments</h2>
            <div className="mt-5 space-y-4">
              {experience.commitments.map((commitment) => (
                <article key={commitment.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-lg font-medium text-white">{commitment.invoiceNumber}</h3>
                  <p className="mt-2 text-sm text-white/65">Amount: ₹{commitment.amountInr.toLocaleString('en-IN')}</p>
                  <p className="mt-2 text-sm text-white/65">Promised date: {commitment.promisedDate}</p>
                  <p className="mt-2 text-sm text-white/65">Status: {commitment.status}</p>
                  <p className="mt-2 text-sm text-white/65">{commitment.note}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Actions</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                {experience.actions.map((action) => (
                  <div key={action.href} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="font-medium text-white">{action.label}</p>
                    <p className="mt-1 text-white/55">{action.href}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}