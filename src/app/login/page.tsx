import type { Route } from 'next'
import Link from 'next/link'
import { getLoginHubExperience } from '@/lib/recovery/surface-composer'

export default function LoginHubPage() {
  const experience = getLoginHubExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Access hub</p>
          <h1 className="mt-4 text-4xl font-semibold">{experience.title}</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">{experience.body}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {experience.cards.map((card) => (
            <Link
              key={card.href}
              href={card.href as Route}
              className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 transition hover:border-cyan-300/40"
            >
              <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">{card.label}</div>
              <div className="mt-4 text-sm leading-7 text-slate-300">{card.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

