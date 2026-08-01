import { organizationProfile } from '../../../lib/recovery/organization-profile'
import { getRuntimeShellAudit } from '../../../lib/recovery/runtime-enforcement-foundation'

export default function AdminRuntimePage() {
  const audit = getRuntimeShellAudit()

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Runtime enforcement</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{audit.title}</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/70">{audit.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Route guards</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {audit.flags.guardsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Live session mode</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {audit.flags.liveSessionEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Protected prefixes</p>
              <p className="mt-3 text-3xl font-semibold text-white">{audit.protectedPrefixes.length}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Canonical trust binding</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <p>{organizationProfile.legalName}</p>
                <p>GSTIN: {organizationProfile.gstin}</p>
                <p>{organizationProfile.principalPlaceOfBusiness.addressLine1}</p>
                <p>
                  {organizationProfile.principalPlaceOfBusiness.city},{' '}
                  {organizationProfile.principalPlaceOfBusiness.state}{' '}
                  {organizationProfile.principalPlaceOfBusiness.postalCode}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Public entry points</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {audit.publicEntryPoints.map((entryPoint) => (
                  <li key={entryPoint} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {entryPoint}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">Governance rules</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {audit.governanceRules.map((rule) => (
                  <li key={rule} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Protected runtime policies</h2>
            <div className="mt-5 space-y-4">
              {audit.policies.map((policy) => (
                <article key={policy.key} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-amber-300">{policy.surface}</p>
                      <h3 className="mt-2 text-lg font-medium text-white">{policy.prefix}</h3>
                    </div>
                    <div className="text-right text-sm text-white/70">
                      <p>Redirect: {policy.redirectTo}</p>
                      <p>Workspace required: {policy.requiresWorkspace ? 'Yes' : 'No'}</p>
                    </div>
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