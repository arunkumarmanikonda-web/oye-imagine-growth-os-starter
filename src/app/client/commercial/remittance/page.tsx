'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

type FundingRequest = {
  request_id: string
  amount: number | string
  currency: string
  remittance_reference: string
  funding_source: string
  paid_at?: string | null
  status: 'submitted' | 'credited' | 'rejected'
  submitted_at: string
  verified_at?: string | null
  credited_at?: string | null
  rejection_reason?: string | null
  note?: string | null
}

type MediaBalance = {
  currency: string
  available: number | string
  reserved: number | string
  spent: number | string
  updated_at: string
}

function money(value: number | string | undefined, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value || 0))
}

export default function ClientCommercialRemittancePage() {
  const [balance, setBalance] = useState<MediaBalance | null>(null)
  const [requests, setRequests] = useState<FundingRequest[]>([])
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [paidAt, setPaidAt] = useState('')
  const [bankName, setBankName] = useState('')
  const [payerName, setPayerName] = useState('')
  const [last4, setLast4] = useState('')
  const [proofReference, setProofReference] = useState('')
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/client/commercial/media-funding', { cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    if (!body.ok) {
      setNotice(body.error || 'Unable to load remittance status.')
      return
    }
    setBalance(body.balance || null)
    setRequests(body.requests || [])
  }, [])

  useEffect(() => { void load() }, [load])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    try {
      const response = await fetch('/api/client/commercial/media-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          currency: 'INR',
          remittanceReference: reference,
          paidAt: paidAt || null,
          note,
          evidence: { bankName, payerName, sourceAccountLast4: last4, proofReference },
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!body.ok) {
        setNotice(`${body.code || 'submission_failed'}: ${body.error || 'Remittance was not submitted.'}`)
        return
      }
      setNotice('Remittance submitted for finance verification. The amount is not spendable until a separate reviewer verifies the bank/payment evidence.')
      setAmount('')
      setReference('')
      setPaidAt('')
      setBankName('')
      setPayerName('')
      setLast4('')
      setProofReference('')
      setNote('')
      await load()
    } finally {
      setBusy(false)
    }
  }

  const input = 'w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300'

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Media wallet remittance</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Fund media spend with verified money, not balance edits.</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/65">Submit the bank or payment reference after transferring funds. Submission does not credit the media wallet. A separate Oye !magine finance reviewer must verify the evidence before the amount becomes available to campaign execution.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.24em] text-white/45">Available</p><p className="mt-3 text-3xl font-black text-emerald-300">{money(balance?.available, balance?.currency || 'INR')}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.24em] text-white/45">Reserved for campaigns</p><p className="mt-3 text-3xl font-black">{money(balance?.reserved, balance?.currency || 'INR')}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.24em] text-white/45">Settled media spend</p><p className="mt-3 text-3xl font-black">{money(balance?.spent, balance?.currency || 'INR')}</p></div>
          </div>
        </section>

        {notice ? <p className="rounded-2xl bg-emerald-300 p-4 text-sm font-bold text-black" role="status">{notice}</p> : null}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6" autoComplete="off">
            <h2 className="text-xl font-black">Submit remittance evidence</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">Use the actual payment reference. A duplicate reference cannot be submitted twice for the same tenant.</p>
            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2"><input className={input} type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount in INR" required/><input className={input} value="INR" readOnly aria-label="Currency"/></div>
              <input className={input} value={reference} onChange={event => setReference(event.target.value)} placeholder="UTR / payment reference" required/>
              <input className={input} type="datetime-local" value={paidAt} onChange={event => setPaidAt(event.target.value)} aria-label="Payment time"/>
              <input className={input} value={bankName} onChange={event => setBankName(event.target.value)} placeholder="Bank / payment source"/>
              <input className={input} value={payerName} onChange={event => setPayerName(event.target.value)} placeholder="Payer / account holder name"/>
              <input className={input} inputMode="numeric" maxLength={4} value={last4} onChange={event => setLast4(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Source account last 4 digits"/>
              <input className={input} value={proofReference} onChange={event => setProofReference(event.target.value)} placeholder="Bank advice / proof reference (optional)"/>
              <textarea className={`${input} min-h-24`} value={note} onChange={event => setNote(event.target.value)} placeholder="Note for finance reviewer"/>
              <button disabled={busy} className="rounded-full bg-emerald-300 px-5 py-3 font-black text-black disabled:opacity-50">{busy ? 'Submitting…' : 'Submit for verification'}</button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Funding history</h2><button onClick={() => void load()} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold">Refresh</button></div>
            <div className="mt-5 space-y-4">
              {requests.length ? requests.map(request => <article key={request.request_id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-lg font-black">{money(request.amount, request.currency)}</p><p className="mt-1 text-xs text-white/45">{request.remittance_reference}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${request.status === 'credited' ? 'bg-emerald-300 text-black' : request.status === 'rejected' ? 'bg-rose-300 text-black' : 'bg-amber-200 text-black'}`}>{request.status}</span></div>
                <p className="mt-3 text-xs text-white/45">Submitted {new Date(request.submitted_at).toLocaleString()}</p>
                {request.credited_at ? <p className="mt-2 text-xs text-emerald-200">Wallet credited {new Date(request.credited_at).toLocaleString()}</p> : null}
                {request.rejection_reason ? <p className="mt-2 text-sm text-rose-200">Rejected: {request.rejection_reason}</p> : null}
                {request.note ? <p className="mt-3 text-sm leading-6 text-white/60">{request.note}</p> : null}
              </article>) : <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/45">No remittance has been submitted yet.</p>}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
