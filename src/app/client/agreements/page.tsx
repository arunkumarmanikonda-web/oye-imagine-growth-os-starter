import { buildAgreementSignupBlueprint, getCanonicalProviderProfile } from '@/lib/recovery/commercial-agreement-foundation'

export default function ClientAgreementsPage() {
  const provider = getCanonicalProviderProfile()
  const blueprint = buildAgreementSignupBlueprint({
    clientLegalName: 'Prospective client',
    requestedLanes: ['growth_strategy', 'performance_marketing'],
    billingModel: 'monthly_retainer',
    paymentTerm: 'net_15',
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client agreements</div>
          <h1 className="text-4xl font-semibold tracking-tight">Agreement signup starts from one trusted provider profile</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Clients see a governed commercial foundation with canonical legal identity, selected service annexures and transparent approval-to-signature progression.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Provider identity</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-lg font-semibold">{provider.legalName}</div>
            <div className="mt-2 text-sm text-neutral-600">Brand: {provider.brandName}</div>
            <div className="mt-2 text-sm text-neutral-600">GSTIN: {provider.gstin}</div>
            <div className="mt-2 text-sm text-neutral-600">Billing email: {provider.billingEmail}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Signup blueprint</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">Agreement ID</div>
            <div className="mt-2 text-sm text-neutral-600">{blueprint.agreementId}</div>
            <div className="mt-4 text-sm font-semibold">Status</div>
            <div className="mt-2 text-sm text-neutral-600">{blueprint.status}</div>
            <div className="mt-4 text-sm font-semibold">Selected lanes</div>
            <div className="mt-2 text-sm text-neutral-600">{blueprint.requestedLanes.join(', ')}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Scope annexures</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {blueprint.scopeAnnexes.map((annex) => (
            <div key={annex.annexId} className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">{annex.title}</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">{annex.summary}</div>
              <div className="mt-3 text-sm text-neutral-600">Deliverables: {annex.deliverables.join(', ')}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}