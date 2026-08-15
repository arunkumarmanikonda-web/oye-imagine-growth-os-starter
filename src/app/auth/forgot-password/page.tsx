import Link from 'next/link'

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams
  return (
    <main className="auth-premium-page">
      <section className="auth-premium-visual">
        <div className="auth-visual-content">
          <p className="premium-eyebrow">Secure account recovery</p>
          <h1>Reset access without bypassing identity.</h1>
          <p>Enter the email attached to your Oye !magine account. If the account is eligible, Supabase Auth will send a time-limited recovery link to that address.</p>
        </div>
      </section>
      <section className="auth-premium-form-wrap">
        <div className="auth-premium-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Password recovery</p><h2>Request a reset link</h2><span>For privacy, the response does not confirm whether an email is registered.</span></div>
          {params.sent === '1' ? <div className="auth-success" role="status">If an eligible account exists for that address, a recovery email has been requested. Check your inbox and spam folder.</div> : null}
          {params.error ? <div className="auth-error" role="alert">The recovery request could not be completed. Please try again or contact support.</div> : null}
          <form action="/api/auth/forgot-password" method="post" className="auth-premium-form">
            <label>Email address<input type="email" name="email" autoComplete="email" required placeholder="you@company.com" /></label>
            <button type="submit" className="auth-submit">Send recovery link <span aria-hidden="true">→</span></button>
          </form>
          <div className="auth-divider"><span>Remembered it?</span></div>
          <Link className="auth-create-link" href="/login">Return to sign in</Link>
        </div>
      </section>
    </main>
  )
}
