import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function AboutPage() {
  const experience = getLegalGovernanceExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">About</p>
        <h1 className="mt-4 text-4xl font-semibold">About Oye !magine AI Growth OS</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Oye !magine AI Growth OS is operated by {experience.legalIdentity.legalName} and publishes canonical privacy,
          legal, support and compliance surfaces for governed client and operator operations.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Canonical legal identity</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-300">
              <div>
                <dt className="text-slate-500">Brand</dt>
                <dd>{experience.legalIdentity.brandName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Legal entity</dt>
                <dd>{experience.legalIdentity.legalName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Domain</dt>
                <dd>{experience.legalIdentity.domain}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Jurisdiction</dt>
                <dd>{experience.legalIdentity.jurisdiction}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <h2 className="text-xl font-semibold">Governed public compliance surface</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {experience.governanceDocuments.map((doc) => (
                <li key={doc.id}>
                  <span className="font-semibold">{doc.title}</span> - {doc.href}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6 text-sm leading-7 text-slate-300">
          <p>{experience.cmsPublicationNote}</p>
          <p className="mt-3">Support email: {experience.legalIdentity.supportEmail}</p>
        </div>
      </section>
    </main>
  )
}