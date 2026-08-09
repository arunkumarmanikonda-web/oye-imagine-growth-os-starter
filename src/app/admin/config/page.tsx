import { getOperatorControlPlaneExperience } from '@/lib/recovery/operator-control-plane-foundation'

export default function AdminConfigPage() {
  const experience = getOperatorControlPlaneExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Operator config</p>
        <h1 className="mt-4 text-4xl font-semibold">Configuration control and runtime safeguards</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Canonical operator configuration surfaces for workspace truth, support controls and launch-safe publication settings.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {experience.configOperations.map((card) => (
            <article key={card.title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.summary}</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                {card.checkpoints.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
          <h2 className="text-xl font-semibold">Cleanup checklist</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {experience.cleanupChecklist.map((item) => (
              <li key={item.label}>
                {item.label}: <span className="font-semibold text-cyan-300">{item.result}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}