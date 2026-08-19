import Link from 'next/link'
import { buildAgreementExecutionPackage } from '@/lib/recovery/commercial-agreement-execution'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientAgreementExecutionPage() {
  const context = await requireClientSurfaceContext('/client/agreements/execution')

  if (!context.isDemo) {
    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Agreement execution</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Verified signature state only</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">No verified execution package is attached to {context.displayName} on this surface yet. Synthetic signatory names, approval chains and readiness flags are intentionally withheld from production client accounts.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/client/agreements" className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Back to agreements</Link><Link href="/support" className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium">Support</Link></div>
        </section>
      </div>
    )
  }

  const executionPackage = buildAgreementExecutionPackage({clientLegalName:'Demo client',requestedLanes:['growth_strategy','performance_marketing'],billingModel:'monthly_retainer',paymentTerm:'net_15'})
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-amber-300 bg-white px-8 py-10 shadow-sm"><div className="text-xs uppercase tracking-[0.35em] text-amber-600">Authenticated demo / Agreement execution fixture</div><h1 className="mt-4 text-4xl font-semibold tracking-tight">Signature preparation example</h1><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">These artifacts and readiness values are demo fixtures, not an issued client package.</p></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"><div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Demo artifacts</div><div className="mt-5 grid gap-4">{executionPackage.artifacts.map((artifact)=><div key={artifact.artifactId} className="rounded-2xl bg-neutral-50 p-4"><div className="text-sm font-semibold">{artifact.label}</div><div className="mt-2 text-sm text-neutral-600">{artifact.type} · {artifact.status}</div></div>)}</div></div><div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"><div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Demo readiness</div><div className="mt-5 rounded-2xl bg-neutral-50 p-4"><div className="text-sm font-semibold">Ready for dispatch</div><div className="mt-2 text-sm text-neutral-600">{executionPackage.signatureReadiness.readyForDispatch ? 'true' : 'false'}</div></div></div></section>
    </div>
  )
}
