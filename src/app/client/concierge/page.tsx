import type { Route } from 'next'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientConciergePage() {
  const context = await requireClientSurfaceContext('/client/concierge')
  const payload = buildConciergeExperiencePayload(
    context.conciergeScope,
    'client_dashboard',
    'show my available workspace help and next actions'
  )

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Premium concierge</div>
        <h1 className="text-2xl font-semibold">{context.displayName} concierge</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          Results are filtered against the tenant, workspace and brand attached to your verified membership. {context.isDemo ? 'This authenticated demo account may also access labelled fixture resources.' : 'Prototype client fixtures are disabled for this production membership.'}
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Workspace search</div>
        <div className="mt-3 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
          {payload.shell.placeholder}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {payload.shell.promptPresets.map((preset) => (
            <div key={preset.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="font-medium">{preset.label}</div>
              <div className="mt-1 text-sm text-neutral-600">{preset.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Visible artifacts', payload.snapshot.totalResources],
          ['Overdue invoices', payload.snapshot.overdueInvoices],
          ['Pending approvals', payload.snapshot.pendingApprovals],
          ['Support threads', payload.snapshot.openSupportThreads],
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
            <a key={`${chip.kind}-${chip.href}`} href={chip.href as Route} className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
              {chip.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
