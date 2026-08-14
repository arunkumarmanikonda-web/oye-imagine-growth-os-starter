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
        const { data: aalData, error: aalError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (aalError) throw aalError
        if (aalData.currentLevel === 'aal2') {
          if (!cancelled) {
            setMode('ready')
            window.location.assign(destination)
          }
          return
        }

        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors()
        if (factorsError) throw factorsError

        const verifiedTotp = factorsData.totp.find(
          (factor) => factor.status === 'verified',
        )

        if (verifiedTotp) {
          if (!cancelled) {
            setFactorId(verifiedTotp.id)
            setMode('challenge')
          }
          return
        }

        const { data: enrollData, error: enrollError } =
          await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: 'Oye !magine privileged access',
          })

        if (enrollError) throw enrollError
        if (!cancelled) {
          setFactorId(enrollData.id)
          setQrCode(enrollData.totp.qr_code)
          setMode('enroll')
        }
      } catch {
        if (!cancelled) {
          setMessage('MFA setup could not be initialized. Privileged access remains blocked.')
          setMode('error')
        }
      }
    }

    void initialize()
    return () => {
      cancelled = true
    }
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
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: normalizedCode,
      })
      if (verifyError) throw verifyError

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aalError || aalData.currentLevel !== 'aal2') {
        throw aalError ?? new Error('AAL2 not established')
      }

      setMode('ready')
      window.location.assign(destination)
    } catch {
      setMode(qrCode ? 'enroll' : 'challenge')
      setMessage('The verification code was not accepted. Try the current code from your authenticator app.')
    }
  }

  if (mode === 'loading' || mode === 'ready') {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6 text-sm text-slate-300">
        Verifying privileged access assurance…
      </div>
    )
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
        Privileged access · MFA required
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        {mode === 'enroll' ? 'Secure this operator account' : 'Verify your second factor'}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {mode === 'enroll'
          ? 'Scan the QR code with an authenticator app, then enter its six-digit code. The factor secret is not stored by Oye !magine.'
          : 'Enter the current six-digit code from the authenticator app enrolled for this privileged account.'}
      </p>

      {qrCode ? (
        <div className="mt-5 inline-flex rounded-2xl bg-white p-4">
          {/* Supabase returns a QR data URL for TOTP enrollment. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="Authenticator enrollment QR code" width={220} height={220} />
        </div>
      ) : null}

      {message ? (
        <div role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {message}
        </div>
      ) : null}

      {mode === 'error' ? (
        <a className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white" href="/login/admin">
          Return to operator sign in
        </a>
      ) : (
        <form onSubmit={verify} className="mt-6">
          <label className="block text-sm text-slate-200">
            Six-digit authenticator code
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-lg tracking-[0.3em] text-white outline-none focus:border-cyan-300"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </label>
          <button
            type="submit"
            disabled={mode === 'verifying'}
            className="mt-5 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === 'verifying' ? 'Verifying…' : 'Verify and continue'}
          </button>
        </form>
      )}
    </section>
  )
}
