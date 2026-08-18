'use client'

import { useEffect, useMemo, useState } from 'react'

type Ranked = { key: string; count: number }
type ReportRow = {
  report_id: string
  disposition?: string | null
  effective_directive?: string | null
  violated_directive?: string | null
  document_origin?: string | null
  document_path?: string | null
  blocked_origin?: string | null
  blocked_path?: string | null
  source_origin?: string | null
  source_path?: string | null
  line_number?: number | null
  report_count: number
  first_seen_at: string
  last_seen_at: string
}

type Payload = {
  ok: boolean
  code?: string
  hours?: number
  totalReports?: number
  bucketCount?: number
  topBlockedOrigins?: Ranked[]
  topDirectives?: Ranked[]
  rows?: ReportRow[]
}

export default function CspTelemetryAdminPage() {
  const [hours, setHours] = useState(168)
  const [payload, setPayload] = useState<Payload | null>(null)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    let cancelled = false
    setBusy(true)
    void fetch(`/api/admin/security/csp?hours=${hours}`, { cache: 'no-store' })
      .then(async response => ({ response, body: await response.json().catch(() => ({})) }))
      .then(({ response, body }) => {
        if (cancelled) return
        setPayload({ ...body, ok: response.ok && body.ok !== false })
      })
      .finally(() => { if (!cancelled) setBusy(false) })
    return () => { cancelled = true }
  }, [hours])

  const enforcementSignal = useMemo(() => {
    if (!payload?.ok) return { label: 'UNAVAILABLE', detail: 'Telemetry cannot be evaluated.' }
    if (!payload.totalReports) return { label: 'OBSERVING', detail: 'No representative violations have been collected yet. Keep CSP report-only.' }
    return { label: 'REVIEW REQUIRED', detail: 'Review recurring directives and blocked origins before any enforcement change.' }
  }, [payload])

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-3xl border border-white/10 bg-black p-6 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Security telemetry</p>
            <h1 className="mt-2 text-3xl font-semibold">Content Security Policy</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/60">Durable, privacy-minimized report-only evidence. Query strings and raw IP addresses are not stored. Enforcement remains a separate release decision.</p>
          </div>
          <label className="text-xs uppercase tracking-wider text-white/50">
            Window
            <select className="ml-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white" value={hours} onChange={event => setHours(Number(event.target.value))}>
              <option className="text-black" value={24}>24 hours</option>
              <option className="text-black" value={168}>7 days</option>
              <option className="text-black" value={720}>30 days</option>
            </select>
          </label>
        </div>
      </section>

      {busy ? <div className="rounded-2xl border border-white/10 bg-black p-5 text-sm text-white/60">Loading telemetry...</div> : null}
      {!busy && payload && !payload.ok ? <div className="rounded-2xl border border-red-300/30 bg-red-950/30 p-5 text-sm text-red-100">Telemetry unavailable: {payload.code || 'request_failed'}</div> : null}

      {!busy && payload?.ok ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white"><p className="text-xs uppercase tracking-wider text-white/50">Reports</p><p className="mt-2 text-3xl font-semibold">{payload.totalReports || 0}</p></article>
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white"><p className="text-xs uppercase tracking-wider text-white/50">Unique hourly buckets</p><p className="mt-2 text-3xl font-semibold">{payload.bucketCount || 0}</p></article>
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white"><p className="text-xs uppercase tracking-wider text-white/50">Enforcement signal</p><p className="mt-2 text-lg font-semibold">{enforcementSignal.label}</p><p className="mt-2 text-xs text-white/55">{enforcementSignal.detail}</p></article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white">
              <h2 className="text-lg font-semibold">Top blocked origins</h2>
              <div className="mt-4 space-y-2">{(payload.topBlockedOrigins || []).length ? payload.topBlockedOrigins!.map(item => <div key={item.key} className="flex justify-between gap-4 text-sm"><span className="truncate text-white/70">{item.key}</span><strong>{item.count}</strong></div>) : <p className="text-sm text-white/50">No violations captured.</p>}</div>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black p-5 text-white">
              <h2 className="text-lg font-semibold">Top directives</h2>
              <div className="mt-4 space-y-2">{(payload.topDirectives || []).length ? payload.topDirectives!.map(item => <div key={item.key} className="flex justify-between gap-4 text-sm"><span className="truncate text-white/70">{item.key}</span><strong>{item.count}</strong></div>) : <p className="text-sm text-white/50">No violations captured.</p>}</div>
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-black text-white">
            <div className="border-b border-white/10 p-5"><h2 className="text-lg font-semibold">Recent evidence</h2></div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-white/5 text-white/45"><tr><th className="px-4 py-3">Last seen</th><th className="px-4 py-3">Directive</th><th className="px-4 py-3">Document</th><th className="px-4 py-3">Blocked</th><th className="px-4 py-3">Count</th></tr></thead>
                <tbody>{(payload.rows || []).map(row => <tr key={row.report_id} className="border-t border-white/5"><td className="whitespace-nowrap px-4 py-3 text-white/55">{new Date(row.last_seen_at).toLocaleString()}</td><td className="px-4 py-3">{row.effective_directive || row.violated_directive || 'unknown'}</td><td className="max-w-xs truncate px-4 py-3 text-white/65">{row.document_origin || 'unknown'}{row.document_path || ''}</td><td className="max-w-xs truncate px-4 py-3 text-white/65">{row.blocked_origin || 'unknown'}{row.blocked_path || ''}</td><td className="px-4 py-3 font-semibold">{row.report_count}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}
