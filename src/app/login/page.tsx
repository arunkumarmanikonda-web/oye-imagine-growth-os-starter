import Link from 'next/link'

const errorCopy: Record<string, string> = {
  missing_credentials: 'Enter your email and password to continue.',
  invalid_credentials: 'We could not verify those credentials.',
  identity_verification_failed: 'Your identity could not be verified. Please try again.',
  access_control_unavailable: 'Access controls are temporarily unavailable. Please try again shortly.',
  access_denied: 'This account does not yet have an active Oye !magine workspace membership.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const message = params.error ? errorCopy[params.error] ?? 'Sign in could not be completed.' : null

  return (
    <main className="auth-premium-page">
      <section className="auth-premium-visual">
        <div className="auth-orbit auth-orbit-yellow" aria-hidden="true" />
        <div className="auth-orbit auth-orbit-pink" aria-hidden="true" />
        <div className="auth-visual-content">
          <p className="premium-eyebrow">One identity. The right workspace.</p>
          <h1>Sign in once.<br />Oye takes you where you belong.</h1>
          <p>Super users, marketers, designers, approvers, analysts, partners and clients all enter through the same secure door. Your verified role decides what you can see and do.</p>
          <div className="auth-role-cloud" aria-label="Supported workspace roles">
            {['Super User','Client Admin','Digital Marketer','Designer','Account Manager','Finance','Analyst','Partner','Viewer'].map((role, index) => (
              <span key={role} className={index % 3 === 0 ? 'is-yellow' : index % 3 === 1 ? 'is-pink' : ''}>{role}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-premium-form-wrap">
        <div className="auth-premium-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Welcome back</p><h2>Continue to your workspace</h2><span>Your access scope is resolved automatically after your identity is verified.</span></div>
          {message ? <div className="auth-error" role="alert">{message}</div> : null}
          <form action="/api/auth/login" method="post" className="auth-premium-form">
            <label>Email address<input type="email" name="email" autoComplete="username" required placeholder="you@company.com" /></label>
            <label>Password<input type="password" name="password" autoComplete="current-password" required placeholder="Your password" /></label>
            <div className="auth-form-meta"><label className="auth-checkbox"><input type="checkbox" name="remember" /> <span>Keep me signed in</span></label><Link href="/contact">Need help?</Link></div>
            <button type="submit" className="auth-submit">Sign in securely <span aria-hidden="true">→</span></button>
          </form>
          <div className="auth-divider"><span>New to Oye !magine?</span></div>
          <Link className="auth-create-link" href="/signup">Create a customer account</Link>
          <p className="auth-security-note"><span aria-hidden="true">◈</span> Privileged roles are automatically challenged for MFA. Role selection is never trusted from the browser.</p>
        </div>
      </section>
    </main>
  )
}
