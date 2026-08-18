'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

const NEEJEE_WORKSPACE_ID = 'f2132e6f-b8e6-4929-8fd4-55da90c2be30'

type Status = {
  killSwitch: boolean
  policy: any
  mediaBalance: any
  providers: Record<string, any>
  channelReadiness: any[]
  recentRuns: any[]
  autonomousApprovalPolicies: any[]
  target: any
}

export default function AutonomyControlPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState(NEEJEE_WORKSPACE_ID)
  const [channel, setChannel] = useState('google_ads')
  const [readinessNote, setReadinessNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch(`/api/admin/autonomy?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    if (body.ok) setStatus(body)
    else setNotice(body.code || 'Autonomy status could not be loaded.')
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { void load() }, [load])

  async function post(payload: Record<string, unknown>) {
    const response = await fetch('/api/admin/autonomy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const body = await response.json().catch(() => ({}))
    setNotice(body.ok ? 'Control-plane change completed.' : `${body.code || 'request_failed'}`)
    await load()
    return body
  }

  const providerEntries = useMemo(() => Object.entries(status?.providers || {}), [status])
  const activeChannels = new Set((status?.channelReadiness || []).filter(row => ['ready', 'passed', 'verified', 'green', 'approved'].includes(String(row.qa_status || '').toLowerCase())).map(row => row.channel))

  function markReadiness(event: FormEvent) {
    event.preventDefault()
    void post({ operation: 'record_channel_readiness', workspaceId, channel, ready: true, note: readinessNote })
  }

  return <main className="min-h-screen bg-[#101214] px-5 py-8 text-[#fffdf8] md:px-8"><section className="mx-auto max-w-[1500px]">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#fdca5a]">Autonomous Growth Control Plane</p><h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-6xl">Unattended execution, bounded by money, authority and provider truth.</h1><p className="mt-5 max-w-4xl text-sm leading-7 text-white/60">The growth executor cannot invent budget, bypass channel QA, skip consent, reuse a consequential action twice or call a provider live merely because an internal screen says it succeeded. The kill switch overrides every autonomous action.</p></div><button onClick={() => void load()} className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold">Refresh</button></div>

    {notice ? <p className="mt-5 rounded-2xl bg-[#f7adc8] p-4 font-bold text-black" role="status">{notice}</p> : null}

    <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4"><label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Workspace</label><input value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} className="min-w-[330px] flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm"/><span className="text-xs text-white/40">{loading ? 'Loading…' : status?.target?.tenantSlug || 'Unknown tenant'}</span></div>

    <section className="mt-6 grid gap-4 md:grid-cols-3">
      <article className={`rounded-[2rem] border p-6 ${status?.killSwitch ? 'border-[#f7adc8]/60 bg-[#f7adc8]/10' : 'border-emerald-300/40 bg-emerald-300/10'}`}><p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Global kill switch</p><h2 className="mt-3 text-3xl font-black">{status?.killSwitch ? 'ACTIVE' : 'RELEASED'}</h2><p className="mt-3 text-sm leading-6 text-white/60">{status?.killSwitch ? 'Autonomous consequential actions are blocked.' : 'Eligible actions may self-execute inside their envelopes.'}</p><button onClick={() => void post({ operation: 'set_kill_switch', workspaceId, active: !status?.killSwitch })} className="mt-5 rounded-full bg-[#fdca5a] px-5 py-3 text-xs font-black text-black">{status?.killSwitch ? 'Release autonomy' : 'Activate kill switch'}</button></article>
      <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Autonomy level</p><h2 className="mt-3 text-3xl font-black">Level {status?.policy?.autonomy_level ?? '—'}</h2><p className="mt-3 text-sm leading-6 text-white/60">Agent: {status?.policy?.agent_key || 'not installed'} · Tool calls/run: {status?.policy?.max_tool_calls ?? '—'}</p></article>
      <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Prepaid media wallet</p><h2 className="mt-3 text-3xl font-black">{status?.mediaBalance ? `${status.mediaBalance.currency} ${Number(status.mediaBalance.available || 0).toLocaleString()}` : 'Not funded'}</h2><p className="mt-3 text-sm leading-6 text-white/60">Reserved {Number(status?.mediaBalance?.reserved || 0).toLocaleString()} · Spent {Number(status?.mediaBalance?.spent || 0).toLocaleString()}</p></article>
    </section>

    <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#fdca5a]">Providers</p><h2 className="mt-2 text-2xl font-black">Runtime and provider-side readiness</h2></div><p className="text-xs text-white/40">No secret values are rendered here.</p></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{providerEntries.map(([key, provider]) => { const ready = provider.runtimeConfigured !== false && provider.accountConnected !== false && provider.providerVerified !== false && !provider.blocker; return <article key={key} className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="flex items-center justify-between gap-3"><strong className="uppercase tracking-[0.08em]">{key.replaceAll('_', ' ')}</strong><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${ready ? 'bg-emerald-300 text-black' : 'bg-[#f7adc8] text-black'}`}>{ready ? 'Ready' : 'Blocked'}</span></div><p className="mt-3 text-xs leading-5 text-white/50">Adapter {provider.adapter || (key === 'google_ads' ? 'google' : 'not configured')} · Runtime {provider.runtimeConfigured === false ? 'missing' : 'configured'}{provider.accountConnected === false ? ' · account not connected' : ''}{provider.providerVerified === false ? ' · provider verification missing' : ''}{provider.blocker ? ` · ${provider.blocker}` : ''}</p></article>})}</div></section>

    <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#fdca5a]">Channel QA</p><h2 className="mt-2 text-2xl font-black">Provider-side publish readiness</h2><div className="mt-5 grid gap-3">{status?.channelReadiness?.length ? status.channelReadiness.map(row => <div key={`${row.channel}-${row.created_at}`} className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="flex items-center justify-between"><strong>{row.channel}</strong><span className={activeChannels.has(row.channel) ? 'text-emerald-300' : 'text-[#f7adc8]'}>{row.qa_status}</span></div><p className="mt-2 text-xs text-white/45">{row.next_action}</p></div>) : <p className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/50">No channel has yet been marked provider-verified.</p>}</div></div><form onSubmit={markReadiness} className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7adc8]">Operator attestation</p><h2 className="mt-2 text-xl font-black">Record QA only after a real provider test.</h2><select value={channel} onChange={event => setChannel(event.target.value)} className="mt-5 w-full rounded-xl border border-white/15 bg-black p-3"><option>google_ads</option><option>email</option><option>whatsapp</option><option>sms</option><option>meta</option><option>linkedin</option><option>youtube</option></select><textarea value={readinessNote} onChange={event => setReadinessNote(event.target.value)} rows={4} placeholder="Provider test evidence / note" className="mt-3 w-full rounded-xl border border-white/15 bg-black p-3 text-sm"/><button className="mt-3 w-full rounded-full border border-[#fdca5a] px-4 py-3 text-xs font-black text-[#fdca5a]">Record provider QA verified</button></form></section>

    <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#fdca5a]">Recent autonomous runs</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="text-white/40"><tr><th className="pb-3">Created</th><th>Action</th><th>Channel</th><th>Status</th><th>Amount</th><th>Reservation</th><th>Provider resource</th><th>Error</th></tr></thead><tbody>{(status?.recentRuns || []).map(run => <tr key={run.run_id} className="border-t border-white/10"><td className="py-3">{new Date(run.created_at).toLocaleString()}</td><td>{run.action_key}</td><td>{run.channel}</td><td className="font-bold">{run.status}</td><td>{run.currency} {run.requested_amount}</td><td>{run.reservation_state}</td><td className="max-w-[220px] truncate">{run.external_resource_id || '—'}</td><td>{run.error_code || '—'}</td></tr>)}</tbody></table></div></section>
  </section></main>
}
