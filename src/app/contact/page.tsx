import { getContactExperience } from '@/lib/recovery/surface-composer'

export default function ContactPage() {
  const experience = getContactExperience()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm lg:px-12 lg:py-14">
          <div className="max-w-4xl space-y-5">
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Contact</div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-6xl">{experience.hero.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-600 lg:text-lg">{experience.hero.summary}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {experience.contactCards.map((card) => (
            <div key={card.id} className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-neutral-500">{card.label}</div>
              <div className="mt-3 text-lg font-semibold">{card.value}</div>
              <div className="mt-3 text-sm leading-6 text-neutral-600">{card.summary}</div>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Support channels</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {experience.supportChannels.map((channel) => (
              <a
                key={channel.id}
                href={channel.href}
                className="rounded-2xl bg-neutral-50 p-4 no-underline transition hover:bg-neutral-100"
              >
                <div className="text-xs uppercase tracking-wide text-neutral-500">{channel.provider}</div>
                <div className="mt-2 text-lg font-semibold text-neutral-950">{channel.label}</div>
                <div className="mt-2 text-sm text-neutral-600">{channel.value}</div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Response standards</div>
          <div className="mt-5 grid gap-3">
            {experience.responseStandards.map((line) => (
              <div key={line} className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700">
                {line}
              </div>
            ))}
          </div>
        </section>

        <footer className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-neutral-950">{experience.organization.footerIdentityLine}</div>
        </footer>
      </main>
    </div>
  )
}