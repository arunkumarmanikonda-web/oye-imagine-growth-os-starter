import { buildSocialCrmLifecycleExecutionSnapshot } from "@/lib/recovery/social-crm-lifecycle-foundation";

function Badge({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

export default async function AdminCommercialLifecycleExecutionPage() {
  const snapshot = buildSocialCrmLifecycleExecutionSnapshot();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin / Commercial / Lifecycle Execution
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {snapshot.title}
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Unified operating view for social execution, reputation response, CRM
          stage handling, and lifecycle messaging.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <Badge label="Social posts planned" value={snapshot.summary.socialPostsPlanned} />
        <Badge label="Email touches" value={snapshot.summary.emailTouches} />
        <Badge label="SMS touches" value={snapshot.summary.smsTouches} />
        <Badge label="WhatsApp touches" value={snapshot.summary.whatsappTouches} />
        <Badge
          label="Reputation SLA"
          value={`${snapshot.reputation.responseSlaHours}h`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">CRM stages</h2>
          <ul className="mt-4 space-y-4">
            {snapshot.crmStages.map((stage) => (
              <li key={stage.stage} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{stage.stage}</p>
                <p className="mt-1 text-sm text-slate-600">Owner: {stage.owner}</p>
                <p className="mt-2 text-sm text-slate-700">{stage.primaryGoal}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                  Exit criteria
                </p>
                <p className="text-sm text-slate-700">{stage.exitCriteria}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Reputation guardrails</h2>
          <ul className="mt-4 space-y-4">
            {snapshot.reputation.guardrails.map((item) => (
              <li key={item.title} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-700">Owner: {item.owner}</p>
                <p className="mt-1 text-sm text-slate-700">Target: {item.target}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Lifecycle journeys</h2>
          <ul className="mt-4 space-y-4">
            {snapshot.lifecycleJourneys.map((item) => (
              <li key={item.step} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{item.step}</p>
                <p className="mt-1 text-sm text-slate-700">Channel: {item.channel}</p>
                <p className="mt-1 text-sm text-slate-700">Trigger: {item.trigger}</p>
                <p className="mt-1 text-sm text-slate-700">Success metric: {item.successMetric}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Operator checklist</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {snapshot.operatorChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Social cadence</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {snapshot.socialCalendar.map((entry) => (
              <li key={`${entry.publishOn}-${entry.channel}-${entry.pillar}`}>
                <span className="font-medium text-slate-900">{entry.publishOn}</span>
                {" · "}
                {entry.channel}
                {" · "}
                {entry.format}
                {" · "}
                {entry.pillar}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Email sequence</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {snapshot.messaging.emailSequence.emails.map((email) => (
              <li key={email.id}>
                <span className="font-medium text-slate-900">{email.subject}</span>
                <div className="text-slate-600">Delay: {email.sendDelayDays} day(s)</div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">SMS + WhatsApp</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-medium text-slate-900">SMS messages</p>
              <p>{snapshot.messaging.smsDraft.messages.length}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">WhatsApp messages</p>
              <p>{snapshot.messaging.whatsappDraft.messages.length}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
