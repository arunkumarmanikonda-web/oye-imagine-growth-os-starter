import type { Route } from 'next'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildDemoClientConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export default function SupportCenterConciergePage() {
  const payload = buildConciergeExperiencePayload(
    buildDemoClientConciergeScope(),
    'support_center',
    'show support requests, onboarding blockers and any help articles I should open'
  )

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Support center</div>
        <h1 className="text-2xl font-semibold">{payload.shell.title}</h1>
        <p className="max-w-3xl text-sm text-neutral-600">{payload.shell.subtitle}</p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Visible artifacts', payload.snapshot.totalResources],
          ['Support threads', payload.snapshot.openSupportThreads],
          ['Pending approvals', payload.snapshot.pendingApprovals],
          ['Permission scoped', 'Yes'],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-neutral-500">{payload.guidedAnswer.headline}</div>
        <h2 className="mt-2 text-lg font-medium">{payload.guidedAnswer.summary}</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {payload.guidedAnswer.sourceChips.map((chip) => (
            <a
              key={`${chip.kind}-${chip.href}`}
              href={chip.href as Route}
              className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
            >
              {chip.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}