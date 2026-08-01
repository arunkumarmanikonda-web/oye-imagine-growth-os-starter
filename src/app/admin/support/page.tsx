import { getSupportInboxExperience } from '../../../lib/recovery/support-inbox-foundation'

export default function AdminSupportPage() {
  const experience = getSupportInboxExperience()

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Operator support</p>
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

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Active inbox events</h2>
            <div className="mt-5 space-y-4">
              {experience.events.map((event) => (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">{event.channel}</p>
                      <h3 className="mt-2 text-lg font-medium text-white">{event.subject}</h3>
                      <p className="mt-2 text-sm text-white/65">{event.summary}</p>
                    </div>
                    <div className="text-right text-sm text-white/70">
                      <p>Status: {event.status}</p>
                      <p>Priority: {event.priority}</p>
                      <p>Owner: {event.owner ?? 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                    <p>Requester: {event.requester}</p>
                    <p>Account: {event.accountName}</p>
                    <p>Received: {event.receivedAt}</p>
                    <p>First response due: {event.firstResponseDueAt}</p>
                  </div>

                  <p className="mt-4 text-sm text-white/80">
                    <span className="font-medium text-white">Next action:</span> {event.nextAction}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Canonical mailbox</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>Email: {experience.mailbox.email}</p>
                <p>Phone: {experience.mailbox.phone}</p>
                <p>{experience.trustProfile.legalName}</p>
                <p>GSTIN: {experience.trustProfile.gstin}</p>
                <p>{experience.trustProfile.addressLine}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Queue definitions</h2>
              <div className="mt-4 space-y-4 text-sm text-white/75">
                {experience.queueDefinitions.map((queue) => (
                  <div key={queue.label}>
                    <p className="font-medium text-white">{queue.label}</p>
                    <p className="mt-1">{queue.scope}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Response policy</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                {experience.responsePolicy.map((entry) => (
                  <div key={entry.priority} className="flex items-center justify-between gap-3">
                    <span className="capitalize">{entry.priority}</span>
                    <span>{entry.target}</span>
                  </div>
                ))}
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
        </section>
      </div>
    </main>
  )
}