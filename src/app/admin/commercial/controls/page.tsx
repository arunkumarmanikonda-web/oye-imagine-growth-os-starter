import { getCommercialControlsExperience } from '../../../../lib/recovery/commercial-controls-foundation'

export default function AdminCommercialControlsPage() {
  const experience = getCommercialControlsExperience()

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Commercial controls</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{experience.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{experience.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              { label: 'Total holds', value: String(experience.counts.totalHolds) },
              { label: 'Active holds', value: String(experience.counts.activeHolds) },
              { label: 'Released holds', value: String(experience.counts.releasedHolds) },
              { label: 'Remittances', value: String(experience.counts.remittanceSubmissions) },
              { label: 'Pending validation', value: String(experience.counts.pendingRemittanceValidations) }
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Commercial holds</h2>
            <div className="mt-5 space-y-4">
              {experience.holds.map((hold) => (
                <article key={hold.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-lg font-medium text-white">{hold.accountName}</h3>
                  <p className="mt-2 text-sm text-white/65">Status: {hold.status}</p>
                  <p className="mt-2 text-sm text-white/65">Blocked area: {hold.blockedArea}</p>
                  <p className="mt-2 text-sm text-white/65">{hold.reason}</p>
                  <p className="mt-2 text-sm text-white/65">{hold.releaseCondition}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Remittance submissions</h2>
            <div className="mt-5 space-y-4">
              {experience.remittances.map((submission) => (
                <article key={submission.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-lg font-medium text-white">{submission.invoiceNumber}</h3>
                  <p className="mt-2 text-sm text-white/65">Status: {submission.status}</p>
                  <p className="mt-2 text-sm text-white/65">Reference: {submission.reference}</p>
                  <p className="mt-2 text-sm text-white/65">{submission.note}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}