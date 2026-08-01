import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import {
  buildDemoAdminConciergeScope,
  buildDemoClientConciergeScope,
  buildDemoMarketplaceConciergeScope,
} from '@/lib/ai/concierge-retrieval-registry'

export default function AdminAiConciergePage() {
  const adminScope = buildDemoAdminConciergeScope()
  const clientScope = buildDemoClientConciergeScope()
  const marketplaceScope = buildDemoMarketplaceConciergeScope()

  const adminPayload = buildConciergeExperiencePayload(
    adminScope,
    'help_panel',
    'margin health, secret config and denied results audit'
  )
  const clientPayload = buildConciergeExperiencePayload(
    clientScope,
    'client_dashboard',
    'where is my overdue invoice, latest report and active agreement'
  )
  const marketplacePayload = buildConciergeExperiencePayload(
    marketplaceScope,
    'marketplace_surface',
    'proposal status specialist availability approved deliverables'
  )

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Admin oversight</div>
        <h1 className="text-2xl font-semibold">Premium concierge quality and guardrails</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          Audit prompt coverage, action shortcuts, source linking, and permission-scoped visibility across all authenticated help surfaces.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Admin source chips', adminPayload.guidedAnswer.sourceChips.length],
          ['Client action cards', clientPayload.guidedAnswer.actionCards.length],
          ['Marketplace presets', marketplacePayload.shell.promptPresets.length],
          ['Denied results (admin audit)', adminPayload.guidedAnswer.answer.deniedCount],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Client dashboard', clientPayload.shell.title, clientPayload.guidedAnswer.summary],
          ['Marketplace surface', marketplacePayload.shell.title, marketplacePayload.guidedAnswer.summary],
          ['Help panel', adminPayload.shell.title, adminPayload.guidedAnswer.summary],
        ].map(([label, title, summary]) => (
          <div key={String(label)} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
            <div className="mt-2 text-lg font-medium">{title}</div>
            <div className="mt-2 text-sm text-neutral-600">{summary}</div>
          </div>
        ))}
      </section>
    </div>
  )
}