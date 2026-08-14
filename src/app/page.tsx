import type { Route } from 'next'
import Link from 'next/link'
import { getPublicHomepageExperience } from '../lib/recovery/public-premium-experience'

export default function HomePage() {
  const experience = getPublicHomepageExperience()

  return (
    <div className="oi-page">
      <section className="oi-container">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <article className="rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[8px_8px_0_#111] md:p-10 lg:p-12">
            <p className="inline-flex rounded-full border border-black bg-[var(--oye-pink)] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
              {experience.hero.eyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.065em] text-black md:text-7xl">
              {experience.hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#3d3934] md:text-xl">
              {experience.hero.body}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={experience.hero.primaryAction.href as Route} className="oi-btn oi-btn-primary">
                {experience.hero.primaryAction.label}
              </Link>
              <Link href={experience.hero.secondaryAction.href as Route} className="oi-btn oi-btn-secondary">
                {experience.hero.secondaryAction.label}
              </Link>
              <Link href={experience.hero.tertiaryAction.href as Route} className="oi-btn oi-btn-ghost">
                {experience.hero.tertiaryAction.label}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2" aria-label="Oye Imagine growth loop">
              {experience.growthLoop.map((step, index) => (
                <span key={step} className="inline-flex items-center gap-2">
                  <span className={`rounded-full border border-black px-3 py-1.5 text-xs font-black ${index % 2 === 0 ? 'bg-[var(--oye-yellow)]' : 'bg-[var(--oye-pink-soft)]'}`}>
                    {step}
                  </span>
                  {index < experience.growthLoop.length - 1 ? <span aria-hidden="true">→</span> : null}
                </span>
              ))}
            </div>
          </article>

          <aside className="relative overflow-hidden rounded-[2.25rem] border-2 border-black bg-black p-6 text-white md:p-8">
            <div aria-hidden="true" className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-[var(--oye-yellow)] opacity-95" />
            <div aria-hidden="true" className="absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-[var(--oye-pink)] opacity-90" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--oye-yellow)]">Growth workspace</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">One loop. Clear control.</h2>
                </div>
                <span className="text-3xl" aria-hidden="true">✦</span>
              </div>

              <div className="mt-7 grid gap-3">
                {[
                  ['01', 'Brand truth', 'Approved context before generation'],
                  ['02', 'Strategy', 'Structured priorities and channel plan'],
                  ['03', 'Creative', 'Provider-neutral content workflows'],
                  ['04', 'Approval', 'Human control before high-impact actions'],
                  ['05', 'Performance', 'Evidence, freshness and next action'],
                ].map(([number, title, body], index) => (
                  <div key={title} className="grid grid-cols-[42px_1fr] gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <span className={`grid h-10 w-10 place-items-center rounded-full border border-white/30 text-xs font-black ${index === 2 ? 'bg-[var(--oye-pink)] text-black' : index === 3 ? 'bg-[var(--oye-yellow)] text-black' : 'bg-white/10'}`}>
                      {number}
                    </span>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/70">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs leading-5 text-white/55">
                Workflow illustration. External integrations are presented as live only after provider-side verification.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-label="Company trust details">
          {experience.trustSignals.map((signal, index) => (
            <article key={signal.label} className={`rounded-[1.5rem] border border-black p-5 ${index % 2 === 0 ? 'bg-[var(--oye-yellow-soft)]' : 'bg-[var(--oye-paper)]'}`}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#635c52]">{signal.label}</p>
              <p className="mt-3 break-words text-sm font-black leading-6 text-black">{signal.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em]">How the system thinks</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-black md:text-5xl">
              Intelligence is useful only when the operating system knows what it may do next.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {experience.sections.map((section, index) => (
              <article key={section.id} className={`rounded-[2rem] border-2 border-black p-7 ${index === 0 ? 'bg-[var(--oye-yellow)]' : index === 1 ? 'bg-[var(--oye-pink)]' : 'bg-[var(--oye-paper)]'}`}>
                <p className="text-xs font-black uppercase tracking-[0.22em]">{section.eyebrow}</p>
                <h3 className="mt-5 text-2xl font-black leading-tight tracking-[-0.04em]">{section.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#39352f]">{section.body}</p>
                <ul className="mt-6 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl border border-black/30 bg-white/35 px-4 py-3 text-sm font-bold leading-6">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em]">Start with your own business</p>
              <h2 className="mt-3 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] md:text-5xl">
                Bring the website, brand, catalogue and growth goals. Build the operating loop from there.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#4d4841]">
                The first controlled production proving loop is designed around brand truth, strategy, creative, approved execution, analytics, revenue evidence and commercial reconciliation.
              </p>
            </div>
            <Link href="/contact" className="oi-btn oi-btn-primary whitespace-nowrap">
              Book a live walkthrough
            </Link>
          </div>
        </section>
      </section>
    </div>
  )
}
