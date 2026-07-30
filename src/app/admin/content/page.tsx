import { getAdminContentStudioExperience } from '@/lib/recovery/content-governance'

export default function AdminContentPage() {
  const experience = getAdminContentStudioExperience()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Content studio</div>
          <h1 className="text-4xl font-semibold tracking-tight">Governed edit and publish control</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Final visible-UI control layer for premium surfaces, AI-assisted drafting, publish hardening and immutable legal identity protection.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Editable targets</div>
          <div className="mt-3 text-3xl font-semibold">{experience.governanceSnapshot.editableTargetCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Immutable identity fields</div>
          <div className="mt-3 text-3xl font-semibold">{experience.governanceSnapshot.immutableFieldCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">AI content actions</div>
          <div className="mt-3 text-3xl font-semibold">{experience.governanceSnapshot.aiActionCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Review-required actions</div>
          <div className="mt-3 text-3xl font-semibold">{experience.governanceSnapshot.reviewRequiredActionCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Editable surface targets</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {experience.editableTargets.map((target) => (
              <div key={target.targetId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-xs uppercase tracking-wide text-neutral-500">{target.route}</div>
                <div className="mt-2 text-lg font-semibold">{target.label}</div>
                <div className="mt-3 text-sm text-neutral-600">Fields: {target.editableFields.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Immutable identity rules</div>
          <div className="mt-5 grid gap-3">
            {experience.immutableIdentityFields.map((field) => (
              <div key={field} className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700">
                {field}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">AI-assisted actions</div>
          <div className="mt-5 space-y-4">
            {experience.aiActions.map((action) => (
              <div key={action.actionId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{action.label}</div>
                <div className="mt-2 text-sm text-neutral-600">Output: {action.output}</div>
                <div className="mt-2 text-sm text-neutral-600">
                  Review: {action.requiresReview ? 'Required' : 'Not required'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Workflow lanes</div>
          <div className="mt-5 space-y-4">
            {experience.workflowLanes.map((lane) => (
              <div key={lane.laneId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{lane.label}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{lane.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Live controlled content</div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">Promotions</div>
            <div className="mt-2 text-2xl font-semibold">{experience.publishedPromotions.length}</div>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">Featured people</div>
            <div className="mt-2 text-2xl font-semibold">{experience.featuredPeopleProfiles.length}</div>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">FAQ entries</div>
            <div className="mt-2 text-2xl font-semibold">{experience.faqEntries.length}</div>
          </div>
        </div>
      </section>
    </div>
  )
}