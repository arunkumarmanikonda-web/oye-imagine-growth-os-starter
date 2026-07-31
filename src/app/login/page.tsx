import Link from 'next/link'
import { getLoginHubExperience } from '@/lib/recovery/surface-composer'

export default function LoginHubPage() {
  const experience = getLoginHubExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.hero.eyebrow}</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.hero.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{experience.hero.body}</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {experience.cards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 hover:border-cyan-300/30">
              <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">{card.title}</div>
              <p className="mt-4 text-base leading-7 text-slate-300">{card.body}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6 text-sm leading-7 text-slate-100">
          Auth split foundation is now in place. Route guard enforcement is feature-flagged until the next pass wires the full session flow and protected redirects.
        </div>
      </div>
    </main>
  )
}