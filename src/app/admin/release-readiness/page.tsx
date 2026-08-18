'use client'

import { useEffect, useMemo, useState } from 'react'

type State = 'go' | 'safe_lock' | 'observing' | 'pending_external' | 'human_evidence_required' | 'blocked'
type Item = { id: string; label: string; state: State; detail: string; evidence?: Record<string, unknown> }
type Payload = {
  ok: boolean
  code?: string
  generatedAt?: string
  releaseIdentity?: {
    environment: string
    gitSha: string | null
    expectedMigrationCount: number
    productionMigrationCount: number
    productionMigrationTail: { version: string; name: string }
  }
  decisions?: Record<string, string>
  machineControls?: Item[]
  activationEvidence?: Item[]
  externalRequirements?: Item[]
}

const stateLabels: Record<State, string> = {
  go: 'GO',
  safe_lock: 'SAFE LOCK',
  observing: 'OBSERVING',
  pending_external: 'EXTERNAL EVIDENCE',
  human_evidence_required: 'HUMAN EVIDENCE',
  blocked: 'BLOCKED',
}

function EvidenceCard({ item }: { item: Item }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black p-5 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{item.label}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{item.detail}</p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/75">{stateLabels[item.state]}</span>
      </div>
      {item.evidence ? <pre className="mt-4 max-h-52 overflow-auto rounded-xl bg-white/5 p-3 text-[11px] leading-5 text-white/55">{JSON.stringify(item.evidence, null, 2)}</pre> : null}
    </article>
  )
}

function EvidenceSection({ title, description, items }: { title: string; description: string; items: Item[] }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/55">{description}</p>
      </div>
      <div className="grid gap-4">{items.map(item => <EvidenceCard key={item.id} item={item} />)}</div>
    </section>
  )
}

export default function ReleaseReadinessPage() {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    let cancelled = false
    setBusy(true)
    void fetch('/api/admin/release-status', { cache: 'no-store' })
      .then(async response => ({ response, body: await response.json().catch(() => ({})) }))
      .then(({ response, body }) => {
        if (!cancelled) setPayload({ ...body, ok: response.ok && body.ok !== false })
      })
      .finally(() => { if (!cancelled) setBusy(false) })
    return () => { cancelled = true }
  }, [])

  const headline = useMemo(() => {
    const controlled = payload?.decisions?.controlledPlatformRelease
    const autonomy = payload?.decisions?.fullUnattendedAutonomy
    if (controlled === 'blocked') return 'CONTROLLED RELEASE BLOCKED'
    if (controlled === 'go' && autonomy !== 'eligible_for_deliberate_release') return 'PLATFORM GO · AUTONOMY LOCKED'
    if (controlled === 'go') return 'PLATFORM GO'
    return 'EVIDENCE UNAVAILABLE'
  }, [payload])

  return (
    <main className="space-y-8 p-6">
      <section className="rounded-3xl border border-white/10 bg-black p-6 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Production activation evidence</p>
        <h1 className="mt-2 text-3xl font-semibold">Release Readiness</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-white/60">A build, configured adapter, environment variable or generated artifact is never treated as external production proof. This cockpit separates machine-verifiable platform safety from provider, account-holder and human acceptance evidence.</p>
        <div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold">{headline}</div>
      </section>

      {busy ? <div className="rounded-2xl border border-white/10 bg-black p-5 text-sm text-white/60">Assembling live evidence...</div> : null}
      {!busy && payload && !payload.ok ? <div className="rounded-2xl border border-red-300/30 bg-red-950/30 p-5 text-sm text-red-100">Readiness evidence unavailable: {payload.code || 'request_failed'}</div> : null}

      {!busy && payload?.ok ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white">
              <p className="text-xs uppercase tracking-wider text-white/45">Runtime</p>
              <p className="mt-2 text-xl font-semibold">{payload.releaseIdentity?.environment || 'unknown'}</p>
              <p className="mt-2 break-all text-xs text-white/50">{payload.releaseIdentity?.gitSha || 'SHA unavailable'}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white">
              <p className="text-xs uppercase tracking-wider text-white/45">Schema parity</p>
              <p className="mt-2 text-xl font-semibold">{payload.releaseIdentity?.productionMigrationCount ?? 0} / {payload.releaseIdentity?.expectedMigrationCount ?? 0}</p>
              <p className="mt-2 text-xs text-white/50">{payload.releaseIdentity?.productionMigrationTail?.name || 'tail unavailable'}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white">
              <p className="text-xs uppercase tracking-wider text-white/45">Unrestricted spend/publish</p>
              <p className="mt-2 text-xl font-semibold">NOT ENABLED</p>
              <p className="mt-2 text-xs text-white/50">By design until all real provider, funding and release evidence is complete.</p>
            </article>
          </section>

          <EvidenceSection title="Machine-verifiable controls" description="Live platform evidence that software can evaluate without pretending to be a human or external provider." items={payload.machineControls || []} />
          <EvidenceSection title="Activation evidence" description="Live provider, funding and resource state. Empty evidence remains a blocker, not a green adapter status." items={payload.activationEvidence || []} />
          <EvidenceSection title="External and human requirements" description="These can only close from independently checkable account, provider, repository, dashboard or human acceptance evidence." items={payload.externalRequirements || []} />

          <section className="rounded-2xl border border-white/10 bg-black p-5 text-white">
            <h2 className="text-lg font-semibold">Decision matrix</h2>
            <pre className="mt-4 overflow-auto rounded-xl bg-white/5 p-4 text-xs leading-6 text-white/65">{JSON.stringify(payload.decisions || {}, null, 2)}</pre>
            <p className="mt-4 text-xs text-white/45">Evidence generated {payload.generatedAt ? new Date(payload.generatedAt).toLocaleString() : 'now'}.</p>
          </section>
        </>
      ) : null}
    </main>
  )
}
