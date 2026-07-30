import {
  RECOVERY_ROUTE_GROUPS,
  getCommercialConciergeCrosswalk,
  getIntegrationValidationGate,
  getRecoveryIntegrationSnapshot,
} from '@/lib/recovery/recovery-integration-manifest'

export default function AdminRecoveryPage() {
  const snapshot = getRecoveryIntegrationSnapshot()
  const gate = getIntegrationValidationGate()
  const crosswalk = getCommercialConciergeCrosswalk()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Recovery integration</div>
          <h1 className="text-4xl font-semibold tracking-tight">A + B + C reconciliation command center</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            This integration surface reconciles foundation recovery, commercial operations and concierge experience into one governed route and validation inventory.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Route groups</div>
          <div className="mt-3 text-3xl font-semibold">{snapshot.routeGroupCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Total routes</div>
          <div className="mt-3 text-3xl font-semibold">{snapshot.totalRouteCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Commercial routes</div>
          <div className="mt-3 text-3xl font-semibold">{snapshot.commercialRouteCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Concierge routes</div>
          <div className="mt-3 text-3xl font-semibold">{snapshot.conciergeRouteCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Branch heads</div>
          <div className="mt-5 space-y-4">
            {Object.entries(snapshot.branchHeads).map(([label, sha]) => (
              <div key={label} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{label}</div>
                <div className="mt-2 text-sm text-neutral-600">{sha}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Validation gate</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">Status</div>
            <div className="mt-2 text-sm text-neutral-600">{gate.status}</div>
            <div className="mt-4 text-sm font-semibold">Duplicate routes</div>
            <div className="mt-2 text-sm text-neutral-600">{gate.duplicateRouteCount}</div>
            <div className="mt-4 text-sm font-semibold">Crosswalk pairs</div>
            <div className="mt-2 text-sm text-neutral-600">{gate.crosswalkCount}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Route inventory</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Object.entries(RECOVERY_ROUTE_GROUPS).map(([group, routes]) => (
              <div key={group} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{group}</div>
                <div className="mt-3 space-y-2">
                  {routes.map((route) => (
                    <div key={route} className="text-sm text-neutral-600">{route}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Commercial ↔ concierge crosswalk</div>
          <div className="mt-5 space-y-4">
            {crosswalk.map((item) => (
              <div key={item.audience} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{item.audience}</div>
                <div className="mt-2 text-sm text-neutral-600">Commercial: {item.commercialRoute}</div>
                <div className="mt-2 text-sm text-neutral-600">Billing: {item.billingRoute}</div>
                <div className="mt-2 text-sm text-neutral-600">Agreement: {item.agreementRoute}</div>
                <div className="mt-2 text-sm text-neutral-600">Concierge: {item.conciergeRoute}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}