import { LaunchChecklistSection } from '@/lib/launch/types';

type Props = {
  sections: LaunchChecklistSection[];
  summary: {
    sectionCount: number;
    itemCount: number;
    ready: number;
    blocked: number;
    inProgress: number;
    notStarted: number;
    blockingOpen: number;
  };
};

const stateClassMap: Record<string, string> = {
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  blocked: 'bg-rose-50 text-rose-700 ring-rose-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  not_started: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function LaunchChecklistBoard({ sections, summary }: Props) {
  const evidenceBacklog = sections.filter(
    (section) => section.items.some((item) => item.launchBlocking && item.status !== 'ready')
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{summary.sectionCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Checklist items</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{summary.itemCount}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Ready</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-900">{summary.ready}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">In progress</div>
          <div className="mt-2 text-3xl font-semibold text-amber-900">{summary.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Launch blockers open</div>
          <div className="mt-2 text-3xl font-semibold text-rose-900">{summary.blockingOpen}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Evidence backlog</h2>
        <p className="mt-2 text-sm text-slate-600">
          These sections still need evidence attachment or signoff work before a final go/no-go review.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {evidenceBacklog.map((section) => (
            <span
              key={section.id}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
            >
              {section.title}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {sections.map((section) => (
          <article key={section.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  {section.sourceBatches.map((batch) => (
                    <span
                      key={batch}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700"
                    >
                      {batch}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">{section.description}</p>
              </div>
              <span
                className={
                  'inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ' +
                  (stateClassMap[section.status] || stateClassMap.not_started)
                }
              >
                {section.status.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Required signoff roles</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {section.signoffRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Owner suggestions</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {section.ownerSuggestions.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Item</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Evidence source</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {section.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate-900">
                        <div className="font-medium">{item.label}</div>
                        {item.launchBlocking ? (
                          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                            Launch blocking
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
                            (stateClassMap[item.status] || stateClassMap.not_started)
                          }
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.evidenceSource}</td>
                      <td className="px-4 py-3 text-slate-600">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}