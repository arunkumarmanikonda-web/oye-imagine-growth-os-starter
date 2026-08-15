import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?error=identity_verification_failed')

  return (
    <main className="auth-premium-page">
      <section className="auth-premium-visual">
        <div className="auth-visual-content">
          <p className="premium-eyebrow">Credential security</p>
          <h1>Choose a new password.</h1>
          <p>Use a unique password of at least 12 characters with uppercase and lowercase letters, a number and a symbol.</p>
        </div>
      </section>
      <section className="auth-premium-form-wrap">
        <div className="auth-premium-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Password update</p><h2>Secure this account</h2><span>{user.email}</span></div>
          {params.error ? <div className="auth-error" role="alert">The password did not meet the security policy or could not be updated.</div> : null}
          {params.success === '1' ? <div className="auth-success" role="status">Password updated successfully. You can continue to your workspace.</div> : null}
          {params.success !== '1' ? (
            <form action="/api/auth/update-password" method="post" className="auth-premium-form">
              <label>New password<input type="password" name="password" minLength={12} autoComplete="new-password" required placeholder="New secure password" /></label>
              <label>Confirm new password<input type="password" name="confirmPassword" minLength={12} autoComplete="new-password" required placeholder="Repeat new password" /></label>
              <button type="submit" className="auth-submit">Update password <span aria-hidden="true">→</span></button>
            </form>
          ) : <Link className="auth-create-link" href="/workspace">Continue to workspace</Link>}
        </div>
      </section>
    </main>
  )
}
