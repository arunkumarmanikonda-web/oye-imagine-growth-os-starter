import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const messages: Record<string, string> = {
  mismatch: 'The two passwords do not match.',
  weak_password: 'Use at least 12 characters with uppercase, lowercase, a number and a symbol.',
  password_update_failed: 'The password could not be updated. Please try again.',
  password_flag_clear_failed: 'The password changed, but account activation could not be completed. Submit the form once more.',
}

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const next = typeof params.next === 'string' && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : '/workspace'
  const errorMessage = params.error ? messages[params.error] : null

  return (
    <main className="auth-premium-page">
      <section className="auth-premium-visual">
        <div className="auth-visual-content">
          <p className="premium-eyebrow">Secure your account</p>
          <h1>Replace the temporary credential before the workspace opens.</h1>
          <p>This account was issued with a temporary credential. Set a private password before continuing. Privileged roles will still complete MFA after this step.</p>
        </div>
      </section>
      <section className="auth-premium-form-wrap">
        <div className="auth-premium-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Credential security</p><h2>Choose your own password</h2><span>Minimum 12 characters, including uppercase, lowercase, a number and a symbol.</span></div>
          {errorMessage ? <div className="auth-error" role="alert">{errorMessage}</div> : null}
          <form action="/api/auth/change-password" method="post" className="auth-premium-form">
            <input type="hidden" name="next" value={next} />
            <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
            <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label>
            <button type="submit" className="auth-submit">Save password and continue <span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-security-note">The password change is required before workspace activation and does not reduce any additional MFA requirement assigned to privileged roles.</p>
        </div>
      </section>
    </main>
  )
}
