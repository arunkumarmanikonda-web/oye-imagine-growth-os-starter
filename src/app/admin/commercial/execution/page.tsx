import { getAdminCommercialExecutionExperience } from '@/lib/recovery/commercial-agreement-execution'

export default function AdminCommercialExecutionPage() {
  const experience = getAdminCommercialExecutionExperience()

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Commercial execution</div>
          <h1 className="text-4xl font-semibold tracking-tight">E-sign preparation, artifact packaging and approval execution</h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            B2 wires the commercial agreement from signup blueprint into package assembly, approval execution and signature preparation without breaking canonical provider identity.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Artifact types</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.artifactTypeCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Execution states</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.executionStateCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">E-sign providers</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.eSignProviderCount}</div>
        </div>
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Approval stages</div>
          <div className="mt-3 text-3xl font-semibold">{experience.snapshot.approvalStageCount}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Sample execution package</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {experience.samplePackage.artifacts.map((artifact) => (
              <div key={artifact.artifactId} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{artifact.label}</div>
                <div className="mt-2 text-sm text-neutral-600">Type: {artifact.type}</div>
                <div className="mt-2 text-sm text-neutral-600">Status: {artifact.status}</div>
                <div className="mt-2 text-sm text-neutral-600">Route: {artifact.route}</div>
              </div>
            ))}
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

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Approval progression</div>
          <div className="mt-5 space-y-4">
            {experience.samplePackage.approvalProgress.executionChain.map((stage) => (
              <div key={stage.stage} className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-sm font-semibold">{stage.stage}</div>
                <div className="mt-2 text-sm text-neutral-600">Owner: {stage.owner}</div>
                <div className="mt-2 text-sm text-neutral-600">Execution: {stage.executionStatus}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Signature readiness</div>
          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <div className="text-sm font-semibold">Provider bound</div>
            <div className="mt-2 text-sm text-neutral-600">
              {experience.samplePackage.signatureReadiness.providerBound ? 'true' : 'false'}
            </div>
            <div className="mt-4 text-sm font-semibold">Provider signatory</div>
            <div className="mt-2 text-sm text-neutral-600">{experience.samplePackage.signatureReadiness.providerSignatory}</div>
            <div className="mt-4 text-sm font-semibold">E-sign provider</div>
            <div className="mt-2 text-sm text-neutral-600">{experience.samplePackage.signatureReadiness.eSignProvider}</div>
            <div className="mt-4 text-sm font-semibold">Ready documents</div>
            <div className="mt-2 text-sm text-neutral-600">{experience.samplePackage.signatureReadiness.readyDocumentCount}</div>
          </div>
        </div>
      </section>
    </div>
  )
}