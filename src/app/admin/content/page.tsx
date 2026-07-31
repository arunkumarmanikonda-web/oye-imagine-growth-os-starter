import { getOperatorContentStudioExperience } from '@/lib/recovery/operator-foundation'

export default function AdminContentPage() {
  const experience = getOperatorContentStudioExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.eyebrow}</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.title}</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">{experience.summary}</p>

        <section className="mt-12 grid gap-6 lg:grid-cols-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Homepage sections</div>
            <div className="mt-3 text-4xl font-semibold">{experience.snapshot.homepageSectionCount}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Access paths</div>
            <div className="mt-3 text-4xl font-semibold">{experience.snapshot.accessPathCount}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Support channels</div>
            <div className="mt-3 text-4xl font-semibold">{experience.snapshot.supportChannelCount}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Entity families</div>
            <div className="mt-3 text-4xl font-semibold">{experience.snapshot.controlledEntityFamilies}</div>
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