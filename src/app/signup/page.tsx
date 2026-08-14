import Link from 'next/link'

const errorCopy: Record<string, string> = {
  invalid_signup: 'Complete every required field, use a password of at least 8 characters, and accept the terms.',
  account_creation_failed: 'We could not create the account. The email may already be registered.',
  workspace_provision_failed: 'Your account was not activated because the workspace could not be provisioned safely.',
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  const error = params.error ? errorCopy[params.error] ?? 'Account creation could not be completed.' : null

  return (
    <main className="signup-premium-page">
      <section className="signup-story">
        <p className="premium-eyebrow">Start with the brand. Build the system around it.</p>
        <h1>Your growth workspace is created around your business, not around a template.</h1>
        <p>Creating an account provisions your private tenant, brand workspace, owner membership and dedicated client asset storage. From there Oye !magine can begin onboarding, brand intelligence, strategy, creative and governed execution.</p>
        <div className="signup-steps">
          {[
            ['01','Create your secure account','Identity and company basics'],
            ['02','Private workspace','Tenant, brand and asset storage'],
            ['03','Teach Oye your brand','Website, catalogue, guidelines and goals'],
            ['04','Build the growth loop','Strategy, creative, approvals and evidence'],
          ].map(([number,title,body]) => <div key={number}><span>{number}</span><strong>{title}</strong><small>{body}</small></div>)}
        </div>
      </section>

      <section className="signup-form-wrap">
        <div className="signup-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Create customer account</p><h2>Open your growth workspace</h2><span>You will become the first administrator for this customer workspace.</span></div>
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          {params.success === 'check_email' ? <div className="auth-success" role="status">Your workspace is ready. Confirm your email, then sign in to continue.</div> : null}
          <form action="/api/auth/signup" method="post" className="signup-form">
            <div className="signup-grid-two"><label>Your name<input name="fullName" required autoComplete="name" placeholder="Your full name" /></label><label>Company / legal name<input name="companyName" required autoComplete="organization" placeholder="Company name" /></label></div>
            <label>Brand name<input name="brandName" required placeholder="Brand customers know" /></label>
            <label>Website <span>optional</span><input name="website" type="url" placeholder="https://yourbrand.com" /></label>
            <label>Work email<input name="email" type="email" required autoComplete="email" placeholder="you@company.com" /></label>
            <label>Password<input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" /></label>
            <label className="auth-checkbox signup-terms"><input type="checkbox" name="terms" required /> <span>I agree to the platform terms and acknowledge the privacy notice.</span></label>
            <button type="submit" className="auth-submit">Create my workspace <span aria-hidden="true">→</span></button>
          </form>
          <p className="signup-login-note">Already have access? <Link href="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  )
}
