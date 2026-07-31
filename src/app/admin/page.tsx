import Link from 'next/link'
import { getOperatorDashboardExperience } from '@/lib/recovery/operator-foundation'

export default function AdminPage() {
  const experience = getOperatorDashboardExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <div>
            <div className="text-lg font-semibold">{experience.title}</div>
            <div className="text-sm text-slate-300">{experience.eyebrow}</div>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
            <Link href="/admin" className="hover:text-white">Overview</Link>
            <Link href="/admin/content" className="hover:text-white">Content studio</Link>
            <Link href="/admin/config" className="hover:text-white">Config</Link>
            <Link href="/login" className="hover:text-white">Access hub</Link>
          </nav>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.eyebrow}</div>
            <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{experience.summary}</p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {experience.cards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/30"
                >
                  <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">{card.title}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{card.body}</p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Trust block</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Legal name</div>
                <div className="mt-2 text-lg font-medium">{experience.trustBlock.legalName}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">GSTIN</div>
                <div className="mt-2 text-sm">{experience.trustBlock.taxIdentity.gstin}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Support email</div>
                <div className="mt-2 text-sm">{experience.trustBlock.supportChannels[0].value}</div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}