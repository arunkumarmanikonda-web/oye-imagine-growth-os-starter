import type { Route } from 'next'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildDemoClientConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export default function HelpAssistPage() {
  const payload = buildConciergeExperiencePayload(
    buildDemoClientConciergeScope(),
    'help_panel',
    'contact support, open support requests and show me the next actions I should take'
  )

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Help / Assist</div>
        <h1 className="text-2xl font-semibold">{payload.shell.title}</h1>
        <p className="max-w-3xl text-sm text-neutral-600">{payload.shell.subtitle}</p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Guided answer</div>
        <h2 className="mt-2 text-lg font-medium">{payload.guidedAnswer.summary}</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {payload.guidedAnswer.actionCards.map((card) => (
            <a
              key={card.id}
              href={card.href as Route}
              className="rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-400"
            >
              <div className="font-medium">{card.label}</div>
              <div className="mt-1 text-sm text-neutral-600">{card.description}</div>
            </a>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {payload.guidedAnswer.nextStepCards.map((step) => (
            <div key={step.label} className="rounded-xl bg-neutral-50 p-4">
              <div className="text-sm font-medium">{step.label}</div>
              <div className="mt-1 text-sm text-neutral-600">{step.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}