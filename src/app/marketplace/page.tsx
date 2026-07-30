import Link from 'next/link'
import { getMarketplaceExperience } from '@/lib/recovery/surface-composer'

export default function MarketplacePage() {
  const experience = getMarketplaceExperience()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm lg:px-12 lg:py-14">
          <div className="max-w-4xl space-y-5">
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Marketplace</div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-6xl">{experience.hero.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-600 lg:text-lg">{experience.hero.summary}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {experience.entryCtas.map((cta) => (
                <Link key={cta.href} href={cta.href} className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {experience.lanes.map((lane) => (
            <div key={lane.id} className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-neutral-500">Service lane</div>
              <h2 className="mt-3 text-xl font-semibold">{lane.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{lane.summary}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">How it works</div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {experience.process.map((step, index) => (
              <div key={step.id} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-xs uppercase tracking-wide text-neutral-500">Step {index + 1}</div>
                <div className="mt-2 text-lg font-semibold">{step.title}</div>
                <div className="mt-3 text-sm leading-6 text-neutral-600">{step.summary}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Featured specialists</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {experience.featuredPeople.map((person) => (
                <div key={person.id} className="rounded-2xl bg-neutral-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-neutral-500">{person.role}</div>
                  <div className="mt-2 text-lg font-semibold">{person.displayName}</div>
                  <div className="mt-1 text-sm text-neutral-600">{person.title}</div>
                  <div className="mt-3 text-sm leading-6 text-neutral-600">{person.summary}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Promotions</div>
            <div className="mt-5 space-y-4">
              {experience.promotions.map((promotion) => (
                <div key={promotion.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="text-sm font-semibold">{promotion.title}</div>
                  <div className="mt-2 text-sm leading-6 text-neutral-600">{promotion.summary}</div>
                  <Link href={promotion.ctaHref} className="mt-4 inline-block text-sm font-medium underline">
                    {promotion.ctaLabel}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}