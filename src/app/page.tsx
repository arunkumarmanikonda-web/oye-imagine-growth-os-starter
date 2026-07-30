import Link from 'next/link'
import { getPublicHomepageExperience } from '@/lib/recovery/surface-composer'

export default function HomePage() {
  const experience = getPublicHomepageExperience()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm lg:px-12 lg:py-14">
          <div className="max-w-4xl space-y-5">
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Oye !magine</div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-6xl">{experience.hero.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-600 lg:text-lg">{experience.hero.summary}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {experience.primaryCtas.map((cta) => (
                <Link key={cta.href} href={cta.href} className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Legal identity', experience.organization.legalIdentity.legalName],
            ['GSTIN', experience.organization.legalIdentity.gstin],
            ['Support', experience.organization.contactProfile.supportEmail],
            ['Phone', experience.organization.contactProfile.supportPhone],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
              <div className="mt-3 text-sm font-medium text-neutral-900">{value}</div>
            </div>
          ))}
        </section>

        {experience.metric ? (
          <section className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Trust ribbon</div>
            <h2 className="mt-3 text-2xl font-semibold">{experience.metric.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">{experience.metric.summary}</p>
            <div className="mt-5 text-sm text-neutral-700">{experience.organization.footerIdentityLine}</div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {experience.featureSections.map((section) => (
            <div key={section.id} className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-neutral-500">{section.key.replace(/-/g, ' ')}</div>
              <h3 className="mt-3 text-xl font-semibold">{section.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{section.summary}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Leadership and experts</div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
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
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Promotions and offers</div>
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

        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">FAQ</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {experience.faqEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{entry.question}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{entry.answer}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-neutral-950">{experience.organization.footerIdentityLine}</div>
          <div className="mt-2 text-sm text-neutral-600">{experience.organization.trustCopy}</div>
        </footer>
      </main>
    </div>
  )
}