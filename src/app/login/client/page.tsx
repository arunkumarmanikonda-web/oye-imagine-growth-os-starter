import { getClientLoginExperience } from '@/lib/recovery/auth-entry-foundation'
import { createLoginRedirectPath } from '@/lib/auth/session'

type ClientLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function errorMessage(code: string | undefined) {
  switch (code) {
    case 'missing_credentials':
      return 'Enter your email address and password.'
    case 'invalid_credentials':
      return 'The email address or password is incorrect.'
    case 'identity_verification_failed':
      return 'We could not verify this identity. Please try again.'
    case 'access_control_unavailable':
      return 'Access control is temporarily unavailable. No access has been granted.'
    case 'access_denied':
      return 'This identity does not have access to a client workspace.'
    default:
      return null
  }
}

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const experience = getClientLoginExperience()
  const params = (await searchParams) ?? {}
  const redirectCandidate =
    typeof params.redirectTo === 'string'
      ? params.redirectTo
      : typeof params.redirect === 'string'
        ? params.redirect
        : '/client'
  const redirectTo = createLoginRedirectPath('client', redirectCandidate)
  const errorCode = typeof params.error === 'string' ? params.error : undefined
  const message = errorMessage(errorCode)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.05fr_0.95fr]">
        <article>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{experience.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold">{experience.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{experience.body}</p>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">
            Your workspace is resolved only after your identity is verified and matched to an active tenant membership.
          </div>
        </article>

        <form action="/api/auth/login" method="post" className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
          <input type="hidden" name="lane" value="client" />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Verified client sign in</div>

          {message ? (
            <div role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {message}
            </div>
          ) : null}

          <label className="mt-6 block text-sm text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
              type="email"
              name="email"
              autoComplete="username"
              required
            />
          </label>

          <label className="mt-4 block text-sm text-slate-200">
            Password
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Sign in securely
          </button>
        </form>
      </section>
    </main>
  )
}
