import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

function validTokenHash(value: string) {
  return /^[a-f0-9]{40,128}$/i.test(value)
}

export default async function RecoveryConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string }>
}) {
  const params = await searchParams
  const tokenHash = String(params.token_hash ?? '').trim()
  const valid = validTokenHash(tokenHash)

  return (
    <main className="auth-premium-page">
      <section className="auth-premium-visual">
        <div className="auth-visual-content">
          <p className="premium-eyebrow">Protected recovery handoff</p>
          <h1>One deliberate step before your reset.</h1>
          <p>Oye !magine does not consume the recovery credential merely because an email link was opened. Continue below to verify it securely and choose a new password.</p>
        </div>
      </section>
      <section className="auth-premium-form-wrap">
        <div className="auth-premium-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading">
            <p>Password recovery</p>
            <h2>{valid ? 'Continue securely' : 'Request a fresh recovery link'}</h2>
            <span>{valid ? 'Your recovery credential has not been used yet. The next step verifies it once and opens the password reset screen.' : 'This recovery handoff is incomplete, invalid or expired.'}</span>
          </div>
          {valid ? (
            <form action="/api/auth/recovery/verify" method="post" className="auth-premium-form">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <button type="submit" className="auth-submit">Verify and reset password <span aria-hidden="true">→</span></button>
            </form>
          ) : (
            <Link className="auth-create-link" href="/auth/forgot-password">Request another recovery email</Link>
          )}
          <p className="auth-security-note"><span aria-hidden="true">◈</span> This confirmation step protects single-use reset credentials from automated email-link scanners.</p>
        </div>
      </section>
    </main>
  )
}
