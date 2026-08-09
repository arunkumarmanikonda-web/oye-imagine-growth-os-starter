import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function PrivacyPage() {
  const experience = getLegalGovernanceExperience()
  const privacy = experience.governanceDocuments.find((entry) => entry.id === 'privacy')

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Privacy</p>
        <h1 className="mt-4 text-4xl font-semibold">Privacy and data handling</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{privacy?.summary}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Operational commitments</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {privacy?.obligations.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>

          <aside className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Company contact</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-300">
              <div>
                <dt className="text-slate-500">Legal entity</dt>
                <dd>{experience.legalIdentity.legalName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Support email</dt>
                <dd>{experience.legalIdentity.supportEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">GSTIN</dt>
                <dd>{experience.legalIdentity.gstin}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  )
}