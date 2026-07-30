import { getAdminCommercialFoundationExperience } from '@/lib/recovery/commercial-agreement-foundation'

export default function AdminCommercialPage() {
  const experience = getAdminCommercialFoundationExperience()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Commercial foundation</div>
          <h1 className="text-4xl font-semibold tracking-tight">Agreement signup and canonical legal binding</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Commercial intake now starts from one governed foundation that binds canonical provider identity, scope annexure structure and signature readiness.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Scope lanes</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.availableScopeLaneCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Annex templates</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.annexTemplateCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Approval stages</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.approvalStageCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Immutable provider fields</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.immutableProviderFieldCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Canonical provider identity</div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">{experience.providerProfile.legalName}</div>
              <div className="mt-2 text-sm text-neutral-600">GSTIN: {experience.providerProfile.gstin}</div>
              <div className="mt-2 text-sm text-neutral-600">CIN: {experience.providerProfile.cin}</div>
              <div className="mt-2 text-sm text-neutral-600">PAN: {experience.providerProfile.pan}</div>
              <div className="mt-2 text-sm text-neutral-600">{experience.providerProfile.principalPlaceOfBusiness}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Workflow cards</div>
          <div className="mt-5 space-y-4">
            {experience.workflowCards.map((card) => (
              <div key={card.id} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{card.label}</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{card.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Billing models</div>
          <div className="mt-5 grid gap-3">
            {experience.billingModels.map((item) => (
              <div key={item} className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">{item}</div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Payment terms</div>
          <div className="mt-5 grid gap-3">
            {experience.paymentTerms.map((item) => (
              <div key={item} className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">{item}</div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Scope lanes</div>
          <div className="mt-5 grid gap-3">
            {experience.scopeLanes.map((item) => (
              <div key={item} className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}