import { buildAgreementExecutionPackage } from '@/lib/recovery/commercial-agreement-execution'

export default function ClientAgreementExecutionPage() {
  const executionPackage = buildAgreementExecutionPackage({
    clientLegalName: 'Prospective client',
    requestedLanes: ['growth_strategy', 'performance_marketing'],
    billingModel: 'monthly_retainer',
    paymentTerm: 'net_15',
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Agreement execution</div>
          <h1 className="text-4xl font-semibold tracking-tight">Commercial package and signature preparation</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Clients can see the assembled agreement package, approval status and readiness before signature dispatch.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Artifacts</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {executionPackage.artifacts.map((artifact) => (
              <div key={artifact.artifactId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{artifact.label}</div>
                <div className="mt-2 text-sm text-neutral-600">{artifact.type}</div>
                <div className="mt-2 text-sm text-neutral-600">{artifact.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Signature readiness</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">Provider signatory</div>
            <div className="mt-2 text-sm text-neutral-600">{executionPackage.signatureReadiness.providerSignatory}</div>
            <div className="mt-4 text-sm font-semibold">Client signatory</div>
            <div className="mt-2 text-sm text-neutral-600">{executionPackage.signatureReadiness.clientSignatory}</div>
            <div className="mt-4 text-sm font-semibold">Ready for dispatch</div>
            <div className="mt-2 text-sm text-neutral-600">
              {executionPackage.signatureReadiness.readyForDispatch ? 'true' : 'false'}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Approval progression</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {executionPackage.approvalProgress.executionChain.map((stage) => (
            <div key={stage.stage} className="rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm font-semibold">{stage.stage}</div>
              <div className="mt-2 text-sm text-neutral-600">Owner: {stage.owner}</div>
              <div className="mt-2 text-sm text-neutral-600">Status: {stage.executionStatus}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}