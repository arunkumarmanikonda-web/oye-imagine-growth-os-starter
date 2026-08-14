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
    <main className="min-h-screen bg-[#e7e5e2] px-5 py-12 text-[#111] sm:px-8">
      <section className="mx-auto max-w-xl rounded-[2.25rem] border border-black/10 bg-white p-7 shadow-[0_32px_100px_rgba(17,17,17,0.12)] sm:p-10">
        <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" className="h-10 w-auto" />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em]">Secure your account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Choose your own password.</h1>
        <p className="mt-4 text-base leading-7 text-black/65">
          This account was issued with a temporary credential. You must replace it before Oye opens your workspace. Privileged roles will continue to MFA after this step.
        </p>

        {errorMessage ? <p className="mt-6 rounded-2xl bg-[#f7adc8]/40 px-4 py-3 text-sm font-medium">{errorMessage}</p> : null}

        <form action="/api/auth/change-password" method="post" className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="text-sm font-semibold">New password</span>
            <input name="password" type="password" autoComplete="new-password" minLength={12} required className="mt-2 w-full rounded-2xl border border-black/15 bg-[#f8f7f4] px-4 py-3 outline-none ring-black focus:ring-2" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Confirm password</span>
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required className="mt-2 w-full rounded-2xl border border-black/15 bg-[#f8f7f4] px-4 py-3 outline-none ring-black focus:ring-2" />
          </label>
          <p className="text-xs leading-6 text-black/55">Minimum 12 characters, including uppercase, lowercase, a number and a symbol.</p>
          <button type="submit" className="w-full rounded-full bg-[#111] px-6 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]">Save password and continue</button>
        </form>
      </section>
    </main>
  )
}
