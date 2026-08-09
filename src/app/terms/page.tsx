import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function TermsPage() {
  const experience = getLegalGovernanceExperience()
  const terms = experience.governanceDocuments.find((entry) => entry.id === 'terms')

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Terms</p>
        <h1 className="mt-4 text-4xl font-semibold">Terms of engagement</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{terms?.summary}</p>

        <article className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
          <h2 className="text-xl font-semibold">Governed platform conditions</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {terms?.obligations.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6 text-sm leading-7 text-slate-300">
          <p>Legal entity: {experience.legalIdentity.legalName}</p>
          <p>Jurisdiction: {experience.legalIdentity.jurisdiction}</p>
          <p>Support contact: {experience.legalIdentity.supportEmail}</p>
        </div>
      </section>
    </main>
  )
}