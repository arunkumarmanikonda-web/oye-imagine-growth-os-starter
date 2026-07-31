import { getOperatorConfigExperience } from '@/lib/recovery/operator-foundation'

export default function AdminConfigPage() {
  const experience = getOperatorConfigExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.eyebrow}</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.title}</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">{experience.summary}</p>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Legal profile</div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Legal name</div>
                <div className="mt-2 text-sm">{experience.legalProfile.legalName}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Company type</div>
                <div className="mt-2 text-sm">{experience.legalProfile.companyType}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">CIN</div>
                <div className="mt-2 text-sm">{experience.legalProfile.cin}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">GSTIN</div>
                <div className="mt-2 text-sm">{experience.legalProfile.gstin}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">PAN</div>
                <div className="mt-2 text-sm">{experience.legalProfile.pan}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">TAN</div>
                <div className="mt-2 text-sm">{experience.legalProfile.tan}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Registered address</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">{experience.legalProfile.principalPlaceOfBusiness}</div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Support channels</div>
              <div className="mt-5 space-y-4">
                {experience.supportChannels.map((channel) => (
                  <div key={channel.channel} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{channel.label}</div>
                    <div className="mt-2 text-sm">{channel.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Provider scaffold</div>
              <div className="mt-5 space-y-4">
                {experience.providers.map((provider) => (
                  <div key={provider.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-medium">{provider.name}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{provider.state}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {experience.modules.map((module) => (
            <article key={module.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">{module.title}</div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{module.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}