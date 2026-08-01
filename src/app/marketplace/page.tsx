import Link from 'next/link'
import { getMarketplaceExperience } from '../../lib/recovery/public-premium-experience'

export default function MarketplacePage() {
  const experience = getMarketplaceExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white md:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Marketplace entry</p>
          <h1 className="mt-4 text-4xl font-semibold">{experience.headline}</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">{experience.intro}</p>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {experience.categories.map((category) => (
            <article key={category.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{category.description}</p>
              <p className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                {category.proofPoint}
              </p>
              <Link href={category.href} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                Explore category
              </Link>
            </article>
          ))}
        </section>

        <footer className="flex flex-wrap gap-3">
          {experience.actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.emphasis === 'primary'
                  ? 'rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950'
                  : 'rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white'
              }
            >
              {action.label}
            </Link>
          ))}
        </footer>
      </section>
    </main>
  )
}