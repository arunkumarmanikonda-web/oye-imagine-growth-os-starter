import type { Route } from 'next'
import Link from 'next/link'
import { getPublicHomepageExperience } from '../lib/recovery/public-premium-experience'

export default function HomePage() {
  const experience = getPublicHomepageExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{experience.hero.eyebrow}</p>
            <p className="text-sm text-slate-300">{experience.legalIdentity.legalName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
            {experience.navigation.map((item) => (
              <Link key={item.href} href={item.href as Route} className="rounded-full px-3 py-2 transition hover:bg-white/10">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 px-8 py-12 shadow-2xl shadow-cyan-950/30 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">{experience.hero.eyebrow}</p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              {experience.hero.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">{experience.hero.body}</p>

            <div className="flex flex-wrap gap-3">
              <Link href={experience.hero.primaryAction.href as Route} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
                {experience.hero.primaryAction.label}
              </Link>
              <Link href={experience.hero.secondaryAction.href as Route} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white">
                {experience.hero.secondaryAction.label}
              </Link>
              <Link href={experience.hero.tertiaryAction.href as Route} className="rounded-full px-5 py-3 text-sm font-semibold text-slate-300">
                {experience.hero.tertiaryAction.label}
              </Link>
            </div>
          </div>

          <aside className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Trust surface</p>
            {experience.trustSignals.map((signal) => (
              <div key={signal.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{signal.label}</p>
                <p className="mt-2 text-sm font-medium text-white">{signal.value}</p>
              </div>
            ))}
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {experience.sections.map((section) => (
            <article key={section.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{section.eyebrow}</p>
              <h2 className="mt-4 text-2xl font-semibold">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{section.body}</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}