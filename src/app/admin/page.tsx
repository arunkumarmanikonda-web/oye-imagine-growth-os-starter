import { getOperatorDashboardExperience } from '@/lib/recovery/surface-composer'

export default function AdminPage() {
  const experience = getOperatorDashboardExperience()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Operator command deck</div>
          <h1 className="text-4xl font-semibold tracking-tight">{experience.page.title}</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Govern public content, support routing, provider readiness and workspace context from a premium operator shell.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {experience.contentPanels.map((panel) => (
          <div key={panel.id} className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-neutral-500">{panel.label}</div>
            <div className="mt-3 text-3xl font-semibold">{panel.value}</div>
            <div className="mt-3 text-sm leading-6 text-neutral-600">{panel.summary}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Workspace options</div>
          <div className="mt-5 space-y-4">
            {experience.workspaceOptions.map((workspace) => (
              <div key={workspace.workspaceId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{workspace.label}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{workspace.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Command cards</div>
          <div className="mt-5 space-y-4">
            {experience.commandCenterCards.map((card) => (
              <div key={card.id} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{card.label}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{card.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Published versions</div>
          <div className="mt-3 text-3xl font-semibold">{experience.studioSnapshot.publishedCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Provider readiness</div>
          <div className="mt-3 text-3xl font-semibold">
            {experience.providerSummary.connectedCount}/{experience.providerSummary.totalCount}
          </div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Support flow</div>
          <div className="mt-3 text-3xl font-semibold">{experience.supportSummary.totalMessages}</div>
        </div>
      </section>
    </div>
  )
}