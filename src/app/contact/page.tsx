import { getContactExperience } from '../../lib/recovery/public-premium-experience'

export default function ContactPage() {
  const experience = getContactExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Contact and support</p>
          <h1 className="mt-4 text-4xl font-semibold">{experience.headline}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{experience.intro}</p>

          <div className="mt-8 grid gap-4">
            {experience.supportChannels.map((channel) => (
              <a key={channel.label} href={channel.href} className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{channel.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{channel.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{channel.supportWindow}</p>
              </a>
            ))}
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Legal and trust</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Entity</p>
              <p className="mt-1 text-white">{experience.trustPanel.legalName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">GSTIN</p>
              <p className="mt-1 text-white">{experience.trustPanel.gstin}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Registered address</p>
              <p className="mt-1 text-white">{experience.trustPanel.principalAddress}</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}