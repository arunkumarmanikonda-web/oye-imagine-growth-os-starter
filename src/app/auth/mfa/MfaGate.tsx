'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

type MfaMode = 'loading' | 'enroll' | 'challenge' | 'verifying' | 'ready' | 'error'

function safeAdminRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith('/admin')) return '/admin'
  return value
}

export default function MfaGate({ redirectTo }: { redirectTo: string }) {
  const [mode, setMode] = useState<MfaMode>('loading')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const initialized = useRef(false)
  const destination = safeAdminRedirect(redirectTo)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    let cancelled = false

    async function initialize() {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalError) throw aalError
        if (aalData.currentLevel === 'aal2') {
          if (!cancelled) { setMode('ready'); window.location.assign(destination) }
          return
        }

        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
        if (factorsError) throw factorsError
        const verifiedTotp = factorsData.totp.find((factor) => factor.status === 'verified')
        if (verifiedTotp) {
          if (!cancelled) { setFactorId(verifiedTotp.id); setMode('challenge') }
          return
        }

        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Oye !magine privileged access' })
        if (enrollError) throw enrollError
        if (!cancelled) { setFactorId(enrollData.id); setQrCode(enrollData.totp.qr_code); setMode('enroll') }
      } catch {
        if (!cancelled) { setMessage('MFA setup could not be initialized. Privileged access remains blocked.'); setMode('error') }
      }
    }

    void initialize()
    return () => { cancelled = true }
  }, [destination])

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedCode = code.replace(/\s+/g, '')
    if (!factorId || !/^\d{6}$/.test(normalizedCode)) {
      setMessage('Enter the six-digit code from your authenticator app.')
      return
    }

    setMode('verifying')
    setMessage(null)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code: normalizedCode })
      if (verifyError) throw verifyError
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aalError || aalData.currentLevel !== 'aal2') throw aalError ?? new Error('AAL2 not established')
      setMode('ready')
      window.location.assign(destination)
    } catch {
      setMode(qrCode ? 'enroll' : 'challenge')
      setMessage('The verification code was not accepted. Try the current code from your authenticator app.')
    }
  }

  if (mode === 'loading' || mode === 'ready') {
    return <p className="auth-security-note">Verifying privileged access assurance…</p>
  }

  return (
    <section>
      <div className="auth-form-heading" style={{marginTop:28}}>
        <p>Privileged access · MFA required</p>
        <h2>{mode === 'enroll' ? 'Secure this operator account' : 'Verify your second factor'}</h2>
        <span>{mode === 'enroll' ? 'Scan the QR code with an authenticator app, then enter its six-digit code. The factor secret is not stored by Oye !magine.' : 'Enter the current six-digit code from the authenticator app enrolled for this privileged account.'}</span>
      </div>

      {qrCode ? <div style={{marginTop:24,display:'inline-flex',padding:14,border:'1px solid rgba(17,19,15,.16)',background:'#fff'}}><img src={qrCode} alt="Authenticator enrollment QR code" width={220} height={220} /></div> : null}
      {message ? <div role="alert" className="auth-error">{message}</div> : null}

      {mode === 'error' ? (
        <a className="auth-create-link" style={{marginTop:24}} href="/login/admin">Return to operator sign in</a>
      ) : (
        <form onSubmit={verify} className="auth-premium-form">
          <label>Six-digit authenticator code<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required /></label>
          <button type="submit" disabled={mode === 'verifying'} className="auth-submit">{mode === 'verifying' ? 'Verifying…' : 'Verify and continue'} <span aria-hidden="true">→</span></button>
        </form>
      )}
    </section>
  )
}
