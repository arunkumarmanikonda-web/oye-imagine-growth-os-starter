import {
  getContentControllerPanels,
  getContentStudioSnapshot,
  listAiContentOperations,
  listContentPromotions,
  listPeopleProfiles,
} from '@/lib/recovery/content-controller'

export default function AdminContentPage() {
  const snapshot = getContentStudioSnapshot()
  const panels = getContentControllerPanels()
  const promotions = listContentPromotions()
  const people = listPeopleProfiles()
  const aiOps = listAiContentOperations()

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Recovery A1</div>
        <h1 className="text-2xl font-semibold">Content studio foundation</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          Govern every visible business-facing UI surface through schema-backed content control, revisions,
          promos, people rails and AI-assisted one-click operations.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {panels.map((panel) => (
          <div key={panel.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">{panel.label}</div>
            <div className="mt-2 text-2xl font-semibold">{panel.value}</div>
            <div className="mt-2 text-sm text-neutral-600">{panel.summary}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Studio snapshot</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['Pages', snapshot.totalPages],
              ['Sections', snapshot.totalSections],
              ['Promotions', snapshot.totalPromotions],
              ['People', snapshot.totalPeopleProfiles],
              ['FAQs', snapshot.totalFaqEntries],
              ['Published versions', snapshot.publishedCount],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">{label}</div>
                <div className="mt-2 text-xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">AI one-click operations</div>
          <ul className="mt-4 space-y-3">
            {aiOps.map((operation) => (
              <li key={operation.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="font-medium">{operation.label}</div>
                <div className="mt-1 text-sm text-neutral-600">{operation.description}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Leadership and experts</div>
          <ul className="mt-4 space-y-3">
            {people.map((person) => (
              <li key={person.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="font-medium">{person.displayName}</div>
                <div className="text-sm text-neutral-600">{person.title}</div>
                <div className="mt-1 text-sm text-neutral-600">{person.summary}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Promotions and offers</div>
          <ul className="mt-4 space-y-3">
            {promotions.map((promotion) => (
              <li key={promotion.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="font-medium">{promotion.title}</div>
                <div className="mt-1 text-sm text-neutral-600">{promotion.summary}</div>
                <div className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
                  {promotion.ctaLabel} · {promotion.lifecycleStatus}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}