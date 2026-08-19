import Link from 'next/link'
import { buildAgreementSignupBlueprint, getCanonicalProviderProfile } from '@/lib/recovery/commercial-agreement-foundation'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientAgreementsPage() {
  const context = await requireClientSurfaceContext('/client/agreements')

  if (!context.isDemo) {
    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client agreements</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Verified agreements for {context.displayName}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">No live agreement artifact is attached to this exact membership on this surface yet. Generic signup blueprints are not presented as client-specific agreements in production.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/support" className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Request agreement support</Link><Link href="/client" className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium">Back to workspace</Link></div>
        </section>
      </div>
    )
  }

  const provider = getCanonicalProviderProfile()
  const blueprint = buildAgreementSignupBlueprint({clientLegalName:'Demo client',requestedLanes:['growth_strategy','performance_marketing'],billingModel:'monthly_retainer',paymentTerm:'net_15'})
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-amber-300 bg-white px-8 py-10 shadow-sm"><div className="text-xs uppercase tracking-[0.35em] text-amber-600">Authenticated demo / Agreement blueprint</div><h1 className="mt-4 text-4xl font-semibold tracking-tight">Agreement product example</h1><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">This is a labelled demo blueprint, not a signed or issued client agreement.</p></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"><div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Provider identity</div><div className="mt-5 rounded-2xl bg-neutral-50 p-4"><div className="text-lg font-semibold">{provider.legalName}</div><div className="mt-2 text-sm text-neutral-600">Brand: {provider.brandName}</div></div></div><div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"><div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Demo blueprint</div><div className="mt-5 rounded-2xl bg-neutral-50 p-4"><div className="text-sm font-semibold">Agreement ID</div><div className="mt-2 text-sm text-neutral-600">{blueprint.agreementId}</div><div className="mt-4 text-sm font-semibold">Status</div><div className="mt-2 text-sm text-neutral-600">{blueprint.status}</div></div></div></section>
    </div>
  )
}
