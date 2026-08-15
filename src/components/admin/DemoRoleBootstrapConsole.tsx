'use client'

import { useState } from 'react'

type BootstrapResult = {
  email: string
  roleKey: string
  status: string
  temporaryPassword?: string
  mustChangePassword?: boolean
  demoAccount?: boolean
}

export function DemoRoleBootstrapConsole() {
  const [sharedPassword, setSharedPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<BootstrapResult[]>([])

  async function runBootstrap() {
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const response = await fetch('/api/admin/access/bootstrap-demo-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sharedPassword.trim() ? { temporaryPassword: sharedPassword.trim() } : {}),
      })
      const payload = await response.json()
      if (!response.ok || !payload.ok) throw new Error(payload.message || payload.code || 'Demo bootstrap failed')
      setResults(payload.results ?? [])
      setSharedPassword('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Demo bootstrap failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/[0.05] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fdca5a]">Launch identity bootstrap</p>
      <h2 className="mt-3 text-2xl font-semibold">Create the disposable role test matrix</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
        Creates only missing demo identities for every built-in non-owner role inside the Oye internal tenant. Each account is email-confirmed, marked as a demo identity and forced to change its password on first sign-in.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm">
          <span className="font-semibold">Optional shared temporary password</span>
          <input
            className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder:text-white/35"
            type="password"
            autoComplete="new-password"
            value={sharedPassword}
            onChange={(event) => setSharedPassword(event.target.value)}
            placeholder="Leave blank for unique generated passwords"
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={runBootstrap}
          className="self-end rounded-xl bg-[#fdca5a] px-5 py-3 font-black text-black disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create missing demo identities'}
        </button>
      </div>

      <p className="mt-3 text-xs leading-6 text-white/45">For a safer test estate, leave the password blank and store the generated one-time passwords shown below. This action requires an MFA-authenticated Platform Owner.</p>
      {error ? <div role="alert" className="mt-4 rounded-xl border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {results.length ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/15">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/10 text-white/60"><tr><th className="px-4 py-3">Role</th><th className="px-4 py-3">Login ID</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">One-time password</th></tr></thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.email} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold">{item.roleKey}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.temporaryPassword ?? (item.status === 'already_exists' ? 'Existing credential unchanged' : '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
