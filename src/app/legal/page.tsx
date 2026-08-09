import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function LegalPage() {
  const experience = getLegalGovernanceExperience()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold">Legal identity and company disclosures</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Canonical company identity for Oye !magine AI Growth OS, published as a governed public trust surface.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
          <dl className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
            <div>
              <dt className="text-slate-500">Legal entity</dt>
              <dd>{experience.legalIdentity.legalName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Brand</dt>
              <dd>{experience.legalIdentity.brandName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">CIN</dt>
              <dd>{experience.legalIdentity.cin}</dd>
            </div>
            <div>
              <dt className="text-slate-500">PAN</dt>
              <dd>{experience.legalIdentity.pan}</dd>
            </div>
            <div>
              <dt className="text-slate-500">TAN</dt>
              <dd>{experience.legalIdentity.tan}</dd>
            </div>
            <div>
              <dt className="text-slate-500">GSTIN</dt>
              <dd>{experience.legalIdentity.gstin}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Support email</dt>
              <dd>{experience.legalIdentity.supportEmail}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Support phone</dt>
              <dd>{experience.legalIdentity.supportPhone}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-slate-500">Principal address</dt>
              <dd>{experience.legalIdentity.principalAddress}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  )
}