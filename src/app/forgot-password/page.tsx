import Link from 'next/link'

const messages: Record<string, string> = {
  sent: 'If an account exists for that email, a secure password-reset link has been sent. Check your inbox and spam folder.',
  invalid_email: 'Enter a valid email address.',
  unavailable: 'Password recovery is temporarily unavailable. Please try again or contact support.',
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>
}) {
  const params = await searchParams
  const message = params.status ? messages[params.status] : params.error ? messages[params.error] : null
  const success = params.status === 'sent'

  return (
    <main className="min-h-screen bg-[#e7e5e2] px-5 py-12 text-[#111] sm:px-8">
      <section className="mx-auto max-w-xl rounded-[2.25rem] border border-black/10 bg-white p-7 shadow-[0_32px_100px_rgba(17,17,17,0.12)] sm:p-10">
        <Link href="/" aria-label="Oye !magine home"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" className="h-10 w-auto" /></Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em]">Account recovery</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Reset your password securely.</h1>
        <p className="mt-4 text-base leading-7 text-black/65">Enter the email used for your Oye !magine account. For security, the response does not reveal whether an email is registered.</p>

        {message ? <p role={success ? 'status' : 'alert'} className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${success ? 'bg-emerald-100 text-emerald-950' : 'bg-[#f7adc8]/40'}`}>{message}</p> : null}

        <form action="/api/auth/request-password-reset" method="post" className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold">Email address</span>
            <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="mt-2 w-full rounded-2xl border border-black/15 bg-[#f8f7f4] px-4 py-3 outline-none ring-black focus:ring-2" />
          </label>
          <button type="submit" className="w-full rounded-full bg-[#111] px-6 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]">Send secure reset link</button>
        </form>

        <div className="mt-7 flex flex-wrap justify-between gap-3 text-sm font-medium">
          <Link href="/login" className="underline underline-offset-4">Back to sign in</Link>
          <Link href="/contact" className="underline underline-offset-4">Contact support</Link>
        </div>
      </section>
    </main>
  )
}
