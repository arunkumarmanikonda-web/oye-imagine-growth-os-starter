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
    <section id="contact-form" className="contact-form-section" aria-labelledby="contact-form-title">
      <div className="contact-form-shell">
        <aside className="contact-form-intro">
          <p className="public-kicker">Send the real brief</p>
          <h2 id="contact-form-title">Tell us what the business is trying to grow, fix or build.</h2>
          <p>You do not need a polished RFP. Give us the business context, the problem and the outcome that matters. The enquiry goes into the Oye commercial workflow for structured follow-up.</p>
          <div className="contact-points">
            <div>Product and plan guidance</div>
            <div>Enterprise, managed and white-label scoping</div>
            <div>Integration and security conversations</div>
          </div>
        </aside>

        <form onSubmit={submit} className="contact-form">
          <div className="contact-fields">
            <label>Full name *<input name="fullName" required maxLength={160} autoComplete="name" /></label>
            <label>Company / brand<input name="companyName" maxLength={200} autoComplete="organization" /></label>
            <label>Work email *<input name="email" required type="email" maxLength={320} autoComplete="email" /></label>
            <label>Phone<input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
            <label>I am interested in<select name="interest" value={interest} onChange={(event) => setInterest(event.target.value)}>{interests.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>Preferred language<select name="preferredLanguage" defaultValue="en"><option value="en">English</option><option value="hi">Hindi</option></select></label>
          </div>

          <label>What should we understand? *<textarea name="message" required minLength={10} maxLength={5000} rows={7} placeholder="What does the business sell? What is working? Where is growth stuck? What outcome matters?" /></label>

          <label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>

          <label className="contact-consent"><input name="consentToContact" type="checkbox" required /><span>I agree that Oye !magine may contact me about this enquiry and acknowledge the <Link href="/privacy" target="_blank" className="font-bold underline underline-offset-2">Privacy Notice</Link>. *</span></label>

          {state === 'success' ? <div role="status" className="contact-status success">Enquiry received. It is now in the Oye commercial inbox.</div> : null}
          {state === 'error' ? <div role="alert" className="contact-status error">{error}</div> : null}

          <div className="contact-form-footer">
            <p>Required fields are marked *. Do not include passwords, payment credentials or other secrets in the message.</p>
            <button type="submit" disabled={state === 'sending'} className="contact-submit">{state === 'sending' ? 'Sending…' : 'Send enquiry →'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}
