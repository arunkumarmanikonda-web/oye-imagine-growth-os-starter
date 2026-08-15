'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

type SubmitState = 'idle' | 'sending' | 'success' | 'error'

const interests = [
  ['general', 'General enquiry'],
  ['starter', 'Starter plan'],
  ['growth', 'Growth plan'],
  ['commerce', 'Commerce plan'],
  ['agency', 'Agency plan'],
  ['enterprise', 'Enterprise'],
  ['managed', 'Managed Growth'],
  ['white-label', 'White Label'],
  ['integrations', 'Integrations'],
  ['security', 'Security / procurement'],
  ['partner', 'Partner / specialist'],
] as const

export function PublicContactForm() {
  const [interest, setInterest] = useState('general')
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requested = params.get('interest') || params.get('plan')
    if (requested && interests.some(([value]) => value === requested)) setInterest(requested)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    setError('')

    const form = event.currentTarget
    const data = new FormData(form)
    const params = new URLSearchParams(window.location.search)
    const payload = {
      fullName: String(data.get('fullName') ?? ''),
      companyName: String(data.get('companyName') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      interest: String(data.get('interest') ?? 'general'),
      message: String(data.get('message') ?? ''),
      preferredLanguage: String(data.get('preferredLanguage') ?? 'en'),
      consentToContact: data.get('consentToContact') === 'on',
      website: String(data.get('website') ?? ''),
      sourcePath: `${window.location.pathname}${window.location.search}`,
      plan: params.get('plan') ?? '',
    }

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json()
      if (!response.ok || !body.ok) {
        if (body.code === 'rate_limited') throw new Error('Too many attempts. Please try again shortly.')
        if (body.code === 'invalid_enquiry') throw new Error('Please complete your name, valid email, message and contact consent.')
        throw new Error('We could not submit the enquiry right now. Please try again.')
      }
      form.reset()
      setInterest('general')
      setState('success')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not submit the enquiry right now.')
      setState('error')
    }
  }

  return (
    <section id="contact-form" className="oi-container pb-20 pt-12">
      <div className="grid overflow-hidden rounded-[2.5rem] border-2 border-black bg-white shadow-[8px_8px_0_#111] lg:grid-cols-[.75fr_1.25fr]">
        <aside className="border-b-2 border-black bg-[var(--oye-yellow)] p-7 lg:border-b-0 lg:border-r-2 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em]">Send the real brief</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Tell Oye what you are trying to grow, fix or build.</h2>
          <p className="mt-5 text-base leading-8 text-black/65">You do not need a polished RFP. Give us the business context, the problem and the outcome that matters. The enquiry goes into the Oye commercial inbox for follow-up.</p>
          <div className="mt-7 grid gap-3 text-sm font-bold">
            <div className="rounded-2xl border-2 border-black bg-white/65 p-4">✓ Product and plan guidance</div>
            <div className="rounded-2xl border-2 border-black bg-white/65 p-4">✓ Enterprise, managed and white-label scoping</div>
            <div className="rounded-2xl border-2 border-black bg-white/65 p-4">✓ Integration and security conversations</div>
          </div>
        </aside>

        <form onSubmit={submit} className="grid gap-5 p-7 lg:p-10">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black">Full name *<input name="fullName" required maxLength={160} autoComplete="name" className="rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-black" /></label>
            <label className="grid gap-2 text-sm font-black">Company / brand<input name="companyName" maxLength={200} autoComplete="organization" className="rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-black" /></label>
            <label className="grid gap-2 text-sm font-black">Work email *<input name="email" required type="email" maxLength={320} autoComplete="email" className="rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-black" /></label>
            <label className="grid gap-2 text-sm font-black">Phone<input name="phone" type="tel" maxLength={40} autoComplete="tel" className="rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-black" /></label>
            <label className="grid gap-2 text-sm font-black">I am interested in<select name="interest" value={interest} onChange={(event) => setInterest(event.target.value)} className="rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-black">{interests.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-black">Preferred language<select name="preferredLanguage" defaultValue="en" className="rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-black"><option value="en">English</option><option value="hi">Hindi</option></select></label>
          </div>

          <label className="grid gap-2 text-sm font-black">What should we understand? *<textarea name="message" required minLength={10} maxLength={5000} rows={7} placeholder="What does the business sell? What is working? Where is growth stuck? What outcome matters?" className="resize-y rounded-2xl border-2 border-black bg-[var(--oye-paper)] px-4 py-3 font-semibold leading-7 outline-none focus:ring-2 focus:ring-black" /></label>

          <label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>

          <label className="flex items-start gap-3 rounded-2xl border border-black/15 bg-[var(--oye-paper)] p-4 text-sm leading-6"><input name="consentToContact" type="checkbox" required className="mt-1 h-4 w-4 accent-black" /><span>I agree that Oye !magine may contact me about this enquiry and acknowledge the <Link href="/privacy" target="_blank" className="font-black underline underline-offset-2">Privacy Notice</Link>. *</span></label>

          {state === 'success' ? <div role="status" className="rounded-2xl border-2 border-black bg-[var(--oye-yellow)] p-4 font-black">Enquiry received. It is now in the Oye commercial inbox.</div> : null}
          {state === 'error' ? <div role="alert" className="rounded-2xl border-2 border-black bg-[var(--oye-pink)] p-4 font-black">{error}</div> : null}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-xs leading-5 text-black/50">Required fields are marked *. Do not include passwords, payment credentials or other secrets in the message.</p>
            <button type="submit" disabled={state === 'sending'} className="rounded-full border-2 border-black bg-black px-6 py-3.5 text-sm font-black text-white disabled:opacity-50">{state === 'sending' ? 'Sending…' : 'Send enquiry →'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}
