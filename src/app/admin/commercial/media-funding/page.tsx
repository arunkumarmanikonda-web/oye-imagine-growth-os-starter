'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Workspace = { id: string; name: string; slug: string; brands?: { name?: string }; tenants?: { display_name?: string; slug?: string } }
type FundingRequest = {
  request_id: string
  amount: number | string
  currency: string
  remittance_reference: string
  funding_source: string
  paid_at?: string | null
  evidence?: Record<string, any>
  note?: string | null
  status: 'submitted' | 'credited' | 'rejected'
  submitted_by: string
  submitted_at: string
  verified_by?: string | null
  verified_at?: string | null
  credited_at?: string | null
  rejected_by?: string | null
  rejected_at?: string | null
  rejection_reason?: string | null
}
type Balance = { currency: string; available: number | string; reserved: number | string; spent: number | string; updated_at: string }

function money(value: number | string | undefined, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value || 0))
}

export default function AdminMediaFundingPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [requests, setRequests] = useState<FundingRequest[]>([])
  const [balance, setBalance] = useState<Balance | null>(null)
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState('')
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    void fetch('/api/admin/integrations/targets', { cache: 'no-store' }).then(response => response.json()).then(body => {
      if (!body.ok) return
      setWorkspaces(body.workspaces || [])
      const neejee = (body.workspaces || []).find((workspace: any) => String(workspace.slug).includes('neejee') || String(workspace.brands?.name || '').toLowerCase() === 'neejee')
      setWorkspaceId((neejee || body.workspaces?.[0])?.id || '')
    })
  }, [])

  const load = useCallback(async () => {
    if (!workspaceId) return
    const response = await fetch(`/api/admin/commercial/media-funding?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    if (!body.ok) {
      setNotice(`${body.code || 'load_failed'}: ${body.error || 'Unable to load media funding.'}`)
      return
    }
    setRequests(body.requests || [])
    setBalance(body.balance || null)
  }, [workspaceId])

  useEffect(() => { void load() }, [load])
  const selected = useMemo(() => workspaces.find(workspace => workspace.id === workspaceId), [workspaces, workspaceId])
  const pending = requests.filter(request => request.status === 'submitted')

  async function review(requestId: string, operation: 'verify' | 'reject') {
    const note = reviewNotes[requestId]?.trim() || ''
    if (operation === 'reject' && !note) {
      setNotice('A rejection reason is required.')
      return
    }
    setBusyId(requestId)
    setNotice('')
    try {
      const response = await fetch('/api/admin/commercial/media-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, workspaceId, requestId, note, reason: note }),
      })
      const body = await response.json().catch(() => ({}))
      if (!body.ok) {
        setNotice(`${body.code || 'review_failed'}: ${body.error || 'Funding review failed.'}`)
        return
      }
      setNotice(operation === 'verify' ? 'Funding evidence verified and the media wallet was credited atomically.' : 'Funding request rejected. No wallet or ledger credit was created.')
      setReviewNotes(current => ({ ...current, [requestId]: '' }))
      await load()
    } finally {
      setBusyId('')
    }
  }

  return <main className="min-h-screen bg-[#111] px-6 py-10 text-[#fffdf8]"><section className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#fdca5a]">Finance control plane</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Media funding review</h1><p className="mt-4 max-w-4xl text-sm leading-7 text-white/60">A remittance submission is evidence, not money. Verify only after matching the reference against actual bank/payment truth. The verifier cannot be the same identity that submitted the request. Verification atomically credits the media wallet and immutable commercial ledger.</p></div><div className="flex gap-2"><a href="/admin/autonomy" className="rounded-full border border-[#fdca5a]/50 px-4 py-2 text-sm font-bold text-[#fdca5a]">Autonomy cockpit</a><a href="/admin/integrations" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Provider activation</a></div></div>

    <section className="mt-8 rounded-[2rem] border border-white/15 bg-white/[0.06] p-6"><div className="flex flex-wrap items-center gap-3"><label className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Workspace</label><select value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3">{workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.brands?.name || workspace.name} · {workspace.tenants?.display_name || workspace.tenants?.slug}</option>)}</select><button onClick={() => void load()} className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Refresh</button></div><p className="mt-3 text-xs text-white/45">{selected?.name || 'No workspace selected'} · {workspaceId}</p></section>

    {notice ? <p className="mt-5 rounded-xl bg-[#f7adc8] p-4 text-sm font-bold text-black" role="status">{notice}</p> : null}

    <section className="mt-6 grid gap-4 sm:grid-cols-4"><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/45">Available</p><p className="mt-2 text-2xl font-black text-emerald-300">{money(balance?.available, balance?.currency || 'INR')}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/45">Reserved</p><p className="mt-2 text-2xl font-black">{money(balance?.reserved, balance?.currency || 'INR')}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/45">Spent</p><p className="mt-2 text-2xl font-black">{money(balance?.spent, balance?.currency || 'INR')}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/45">Pending review</p><p className="mt-2 text-2xl font-black text-[#fdca5a]">{pending.length}</p></div></section>

    <section className="mt-6 space-y-4"><h2 className="text-xl font-black">Remittance evidence queue</h2>{requests.length ? requests.map(request => <article key={request.request_id} className="rounded-[2rem] border border-white/15 bg-white/[0.05] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-2xl font-black">{money(request.amount, request.currency)}</p><p className="mt-1 text-sm font-bold text-[#fdca5a]">{request.remittance_reference}</p><p className="mt-2 text-xs text-white/45">Submitted {new Date(request.submitted_at).toLocaleString()} by {request.submitted_by}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${request.status === 'credited' ? 'bg-emerald-300 text-black' : request.status === 'rejected' ? 'bg-rose-300 text-black' : 'bg-amber-200 text-black'}`}>{request.status}</span></div><div className="mt-5 grid gap-3 text-sm text-white/65 md:grid-cols-2"><p>Paid at: {request.paid_at ? new Date(request.paid_at).toLocaleString() : 'not supplied'}</p><p>Funding source: {request.funding_source}</p><p>Bank/source: {request.evidence?.bankName || 'not supplied'}</p><p>Payer: {request.evidence?.payerName || 'not supplied'}</p><p>Account last 4: {request.evidence?.sourceAccountLast4 || 'not supplied'}</p><p>Proof reference: {request.evidence?.proofReference || 'not supplied'}</p></div>{request.note ? <p className="mt-4 rounded-xl bg-black/30 p-4 text-sm leading-6 text-white/65">{request.note}</p> : null}{request.status === 'submitted' ? <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]"><input value={reviewNotes[request.request_id] || ''} onChange={event => setReviewNotes(current => ({ ...current, [request.request_id]: event.target.value }))} placeholder="Verification note or rejection reason" className="rounded-xl border border-white/15 bg-black px-4 py-3 text-sm outline-none focus:border-[#fdca5a]"/><button disabled={busyId === request.request_id} onClick={() => void review(request.request_id, 'verify')} className="rounded-full bg-emerald-300 px-5 py-3 font-black text-black disabled:opacity-50">Verify & credit</button><button disabled={busyId === request.request_id} onClick={() => void review(request.request_id, 'reject')} className="rounded-full bg-rose-300 px-5 py-3 font-black text-black disabled:opacity-50">Reject</button></div> : null}{request.credited_at ? <p className="mt-4 text-xs text-emerald-200">Credited {new Date(request.credited_at).toLocaleString()} by {request.verified_by}</p> : null}{request.rejection_reason ? <p className="mt-4 text-sm text-rose-200">Rejected: {request.rejection_reason}</p> : null}</article>) : <p className="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-white/45">No media funding requests for this workspace.</p>}</section>
  </section></main>
}
