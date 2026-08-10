import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function SupportPage() {
  const experience = getLegalGovernanceExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Support</p>
        <h1 className="mt-4 text-4xl font-semibold">Support operations and publishing governance</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Governed support routes for onboarding, legal questions, CMS publishing changes and accountable client coordination.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {experience.supportChannels.map((channel) => (
            <article key={channel.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{channel.label}</p>
              <p className="mt-3 text-lg font-semibold">{channel.value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{channel.responseWindow}</p>
              <a href={channel.href} className="mt-4 inline-block text-sm font-semibold text-cyan-300">
                Contact via {channel.label.toLowerCase()}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6 text-sm leading-7 text-slate-300">
          <p>{experience.cmsPublicationNote}</p>
          <p className="mt-3">Legal entity: {experience.legalIdentity.legalName}</p>
        </div>
      </section>
    </main>
  )
}