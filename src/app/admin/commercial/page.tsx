import { getOperatorCommercialOperationsExperience } from '../../../lib/recovery/commercial-operations-foundation'

export default function AdminCommercialPage() {
  const experience = getOperatorCommercialOperationsExperience()

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Commercial operations</p>
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
            <h2 className="text-xl font-semibold">Operations</h2>
            <div className="mt-5 space-y-4">
              {experience.operations.map((operation) => (
                <article key={operation.href} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">{operation.label}</h3>
                      <p className="mt-2 text-sm text-white/65">{operation.detail}</p>
                    </div>
                    <p className="text-xs text-white/50">{operation.href}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Issuer identity</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>{experience.issuer.legalName}</p>
                <p>GSTIN: {experience.issuer.gstin}</p>
                <p>CIN: {experience.issuer.cin}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Support identity</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>Email: {experience.supportIdentity.email}</p>
                <p>Phone: {experience.supportIdentity.phone}</p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}