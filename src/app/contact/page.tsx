import { getContactExperience } from '@/lib/recovery/surface-composer'

export default function ContactPage() {
  const experience = getContactExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.hero.eyebrow}</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.hero.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{experience.hero.body}</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {experience.supportChannels.map((channel) => (
            <a key={channel.channel} href={channel.href} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{channel.label}</div>
              <div className="mt-3 text-xl font-semibold">{channel.value}</div>
            </a>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Registered identity</div>
          <div className="mt-4 text-lg font-medium">{experience.trustBlock.legalName}</div>
          <div className="mt-3 text-sm text-slate-300">{experience.trustBlock.registeredAddress}</div>
        </div>
      </div>
    </main>
  )
}