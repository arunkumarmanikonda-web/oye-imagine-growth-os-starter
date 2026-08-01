import type { Route } from 'next'
import Link from 'next/link'
import { getClientLoginExperience } from '../../lib/recovery/auth-entry-foundation'

export default function ClientLoginPage() {
  const experience = getClientLoginExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="space-y-5">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{experience.eyebrow}</p>
          <h1 className="text-4xl font-semibold">{experience.title}</h1>
          <p className="max-w-2xl text-base leading-8 text-slate-300">{experience.body}</p>

          <div className="flex flex-wrap gap-3">
            {experience.actions.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href as Route}
                className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </article>

        <aside className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Client help</p>
          <div className="mt-4 space-y-3">
            {experience.supportLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href as Route} className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200">
                {link.label}
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}