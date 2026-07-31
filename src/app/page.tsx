import Link from 'next/link'
import { getPublicHomepageExperience } from '@/lib/recovery/surface-composer'

export default function HomePage() {
  const experience = getPublicHomepageExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <div>
            <div className="text-lg font-semibold">{experience.trustBlock.brandName}</div>
            <div className="text-sm text-slate-300">{experience.trustBlock.descriptor}</div>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-200">
            {experience.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">{experience.hero.eyebrow}</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight">{experience.hero.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">{experience.hero.body}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {experience.hero.bullets.map((bullet) => (
                <div key={bullet} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  {bullet}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {experience.hero.ctas?.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className={
                    cta.emphasis === 'primary'
                      ? 'rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950'
                      : cta.emphasis === 'secondary'
                      ? 'rounded-full border border-white/20 px-5 py-3 font-medium text-white'
                      : 'rounded-full px-5 py-3 font-medium text-cyan-300'
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Company trust</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Legal name</div>
                <div className="mt-2 text-lg font-medium">{experience.trustBlock.legalName}</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">GSTIN</div>
                  <div className="mt-2 text-sm">{experience.trustBlock.taxIdentity.gstin}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">CIN</div>
                  <div className="mt-2 text-sm">{experience.trustBlock.taxIdentity.cin}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                {experience.trustBlock.registeredAddress}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 pb-16 lg:grid-cols-2">
          {experience.sections.map((section) => (
            <article key={section.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">{section.eyebrow}</div>
              <h2 className="mt-4 text-2xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>{experience.trustBlock.legalName} · GSTIN {experience.trustBlock.taxIdentity.gstin}</div>
            <div className="flex gap-4">
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <Link href="/login" className="hover:text-white">Login</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}