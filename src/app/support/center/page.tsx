import type { Route } from 'next'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { buildPublicSupportConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

export default function SupportCenterConciergePage() {
  const payload = buildConciergeExperiencePayload(
    buildPublicSupportConciergeScope(),
    'support_center',
    'show published support routes and help articles'
  )

  return (
    <main className="public-premium">
      <section className="public-section">
        <div className="public-wrap space-y-6 py-10">
          <header className="space-y-2">
            <div className="public-kicker">Public support center</div>
            <h1 className="text-4xl font-semibold">Published help, without workspace disclosure.</h1>
            <p className="max-w-3xl text-sm text-neutral-600">
              This public surface contains only globally published help and support routes. Sign in to view any workspace-specific agreements, invoices, requests, approvals or support activity.
            </p>
          </header>

          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-neutral-500">Published help resources</div>
              <div className="mt-2 text-2xl font-semibold">{payload.snapshot.totalResources}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-neutral-500">Workspace-specific state</div>
              <div className="mt-2 text-lg font-semibold">Sign in required</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-neutral-500">Data posture</div>
              <div className="mt-2 text-lg font-semibold">Global published only</div>
            </div>
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

          <div className="flex flex-wrap gap-3">
            <a href="/login" className="public-btn-primary">Sign in for workspace support <span>↗</span></a>
            <a href="/contact" className="public-btn-secondary">Contact Oye !magine</a>
          </div>
        </div>
      </section>
    </main>
  )
}
