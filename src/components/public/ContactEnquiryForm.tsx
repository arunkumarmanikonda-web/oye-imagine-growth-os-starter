'use client'

import { FormEvent, useState } from 'react'

export function ContactEnquiryForm() {
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.get('fullName'),
          companyName: form.get('companyName'),
          email: form.get('email'),
          phone: form.get('phone'),
          interest: form.get('interest'),
          message: form.get('message'),
          preferredLanguage: form.get('preferredLanguage'),
          consentToContact: form.get('consentToContact') === 'on',
          website: form.get('website'),
          sourcePath: window.location.pathname + window.location.search,
        }),
      })
      if (!response.ok) throw new Error('submit_failed')
      setState('sent')
      event.currentTarget.reset()
    } catch {
      setState('error')
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-7xl rounded-[2.5rem] border-2 border-black bg-[#111] p-7 text-white shadow-[8px_8px_0_#fdca5a] md:p-10">
      <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#fdca5a]">Tell us the actual problem</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">A rough story is more useful than a polished brief.</h2><p className="mt-5 text-base leading-8 text-white/60">Share the business, the outcome and anything that feels unusual. This goes into the Oye enquiry inbox and can later become the starting evidence for a customer workspace.</p></div>
        <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-white/15 bg-white/[0.05] p-5 md:grid-cols-2 md:p-7">
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <label className="text-sm font-bold">Name<input name="fullName" required className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold">Company<input name="companyName" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold">Work email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold">Phone <span className="font-normal text-white/40">optional</span><input name="phone" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold">What are you exploring?<select name="interest" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal"><option value="growth">Brand growth</option><option value="enterprise">Enterprise</option><option value="managed">Managed Growth</option><option value="agency">Agency</option><option value="white-label">White Label</option><option value="integrations">Integrations</option><option value="security">Security / procurement</option><option value="activation">Activation support</option><option value="general">Something else</option></select></label>
          <label className="text-sm font-bold">Preferred language<select name="preferredLanguage" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal"><option value="en">English</option><option value="hi">Hindi</option></select></label>
          <label className="text-sm font-bold md:col-span-2">Tell Oye what is going on<textarea name="message" required minLength={10} rows={6} placeholder="What do you sell? What is stuck? What would a good outcome look like?" className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-normal" /></label>
          <label className="flex gap-3 text-xs leading-6 text-white/60 md:col-span-2"><input name="consentToContact" type="checkbox" required className="mt-1" /><span>I agree that Oye !magine may contact me about this enquiry. This is not marketing consent for unrelated communication.</span></label>
          <button disabled={state === 'sending'} className="rounded-full bg-[#fdca5a] px-6 py-3.5 font-black text-black md:col-span-2">{state === 'sending' ? 'Sending…' : state === 'sent' ? 'Received ✓' : 'Send to Oye'}</button>
          {state === 'sent' ? <p className="text-sm text-[#c8f7d2] md:col-span-2">Your enquiry has been recorded. Oye has a traceable starting point now.</p> : null}
          {state === 'error' ? <p className="text-sm text-[#f7adc8] md:col-span-2">The enquiry could not be recorded. Please try again.</p> : null}
        </form>
      </div>
    </section>
  )
}
