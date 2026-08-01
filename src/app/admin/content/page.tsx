import { getContentPublishingExperience } from '../../../lib/recovery/content-governance-foundation'

export default function AdminContentPage() {
  const experience = getContentPublishingExperience()

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Content governance</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{experience.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{experience.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {experience.summaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Workflow stages</h2>
              <ol className="mt-4 space-y-3 text-sm text-white/75">
                {experience.workflowStages.map((stage, index) => (
                  <li key={stage} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <span className="mr-2 text-cyan-300">0{index + 1}.</span>
                    {stage}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Governed assets</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div className="flex items-center justify-between gap-3">
                  <span>Pages</span>
                  <span>{experience.governedAssetCounts.pages}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Sections</span>
                  <span>{experience.governedAssetCounts.sections}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Promotions</span>
                  <span>{experience.governedAssetCounts.promotions}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>FAQ entries</span>
                  <span>{experience.governedAssetCounts.faqEntries}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Profiles</span>
                  <span>{experience.governedAssetCounts.peopleProfiles}</span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Governance rules</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {experience.governanceRules.map((rule) => (
                  <li key={rule} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Publish work items</h2>
            <div className="mt-5 space-y-4">
              {experience.workItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{item.state}</p>
                      <h3 className="mt-2 text-lg font-medium text-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/65">
                        Page slug: {item.pageSlug} · Entity: {item.entityType} · Key: {item.entityKey}
                      </p>
                    </div>
                    <div className="text-right text-sm text-white/70">
                      <p>Owner: {item.owner}</p>
                      <p>Preview: {item.previewPath}</p>
                      <p>Rollback: {item.rollbackVersion}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/50">Publish window</p>
                    <p className="mt-2 text-sm text-white/80">{item.publishWindow}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.checklist.map((entry) => (
                      <span
                        key={entry}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                      >
                        {entry}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}