import Link from 'next/link'
import { formatInr, getPublishedPricingCatalog } from '@/lib/public/pricing-runtime'

const LEGAL_VERSION = '2026-08-15'

const errorCopy: Record<string, string> = {
  invalid_signup: 'Complete every required field, use a strong password, choose a valid plan and accept the current Terms and Privacy Policy.',
  account_creation_failed: 'We could not create the account. The email may already be registered.',
  workspace_provision_failed: 'Your account was not activated because the workspace could not be provisioned safely.',
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; plan?: string }>
}) {
  const params = await searchParams
  const { plans } = await getPublishedPricingCatalog()
  const selfServePlans = plans.filter((plan) => ['starter','growth','commerce','agency'].includes(plan.plan_key))
  const selectedPlan = selfServePlans.find((plan) => plan.plan_key === params.plan) ?? selfServePlans[0]
  const error = params.error ? errorCopy[params.error] ?? 'Account creation could not be completed.' : null

  return (
    <main className="signup-premium-page">
      <section className="signup-story">
        <p className="premium-eyebrow">Start with the brand. Build the system around it.</p>
        <h1>Tell Oye the business story. Open the private workspace before high-impact execution is enabled.</h1>
        <p>Your tenant and brand workspace are provisioned first. Oye can begin collecting approved business context while paid, provider-dependent and high-impact capabilities remain gated until the activation requirements for the selected edition are completed and evidenced.</p>
        <div className="signup-steps">
          {[
            ['01','Create the secure workspace','Identity, company and selected edition'],
            ['02','Teach Oye the brand','Website, catalogue, guidelines, audience and goals'],
            ['03','Complete required activation','Commercial, identity and provider steps depend on the selected scope'],
            ['04','Unlock approved capabilities','Modules, roles, approvals, connected execution and reporting'],
          ].map(([number,title,body]) => <div key={number}><span>{number}</span><strong>{title}</strong><small>{body}</small></div>)}
        </div>
      </section>

      <section className="signup-form-wrap">
        <div className="signup-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Create customer account</p><h2>Open your growth workspace</h2><span>You become the first customer administrator for the workspace created from this signup.</span></div>
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          {params.success === 'check_email' ? <div className="auth-success" role="status">Your private workspace is provisioned. Confirm your email, then continue onboarding.</div> : null}

          {selectedPlan ? <div className="mb-6 rounded-[1.5rem] border-2 border-black bg-[#fdca5a] p-5 text-black"><p className="text-xs font-black uppercase tracking-[0.18em]">Selected edition</p><div className="mt-2 flex items-end justify-between gap-4"><div><strong className="text-2xl">{selectedPlan.display_name}</strong><p className="mt-1 text-sm leading-6 text-black/65">{selectedPlan.audience}</p></div><div className="text-right"><b className="text-xl">{formatInr(selectedPlan.monthly_price_inr)}</b><small className="block">/ month</small></div></div><Link href="/pricing" className="mt-3 inline-block text-xs font-black underline">Compare plans</Link></div> : null}

          <form action="/api/auth/signup" method="post" className="signup-form">
            <input type="hidden" name="plan" value={selectedPlan?.plan_key ?? 'starter'} />
            <input type="hidden" name="termsVersion" value={LEGAL_VERSION} />
            <input type="hidden" name="privacyVersion" value={LEGAL_VERSION} />
            <div className="signup-grid-two"><label>Your name<input name="fullName" required autoComplete="name" placeholder="Your full name" /></label><label>Company / legal name<input name="companyName" required autoComplete="organization" placeholder="Company name" /></label></div>
            <label>Brand name<input name="brandName" required placeholder="Brand customers know" /></label>
            <label>Website <span>optional</span><input name="website" type="url" placeholder="https://yourbrand.com" /></label>
            <label>Work email<input name="email" type="email" required autoComplete="email" placeholder="you@company.com" /></label>
            <label>Password<input name="password" type="password" required minLength={12} autoComplete="new-password" placeholder="12+ characters with upper/lowercase, number and symbol" /></label>
            <fieldset className="rounded-2xl border border-black/15 p-4"><legend className="px-2 text-sm font-black">Billing preference</legend><div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="radio" name="billingCadence" value="monthly" defaultChecked /> Monthly</label><label className="flex items-center gap-2"><input type="radio" name="billingCadence" value="annual" /> Annual · {selectedPlan?.annual_label ?? 'annual savings apply'}</label></div></fieldset>
            <label className="auth-checkbox signup-terms"><input type="checkbox" name="terms" required /> <span>I agree to the <Link href="/terms" target="_blank" className="font-black underline">Terms of Service</Link> and acknowledge the <Link href="/privacy" target="_blank" className="font-black underline">Privacy Policy</Link>. Paid and provider-dependent capabilities remain subject to the selected edition and successful activation.</span></label>
            <button type="submit" className="auth-submit">Create private workspace <span aria-hidden="true">→</span></button>
          </form>
          <p className="signup-login-note">Already have access? <Link href="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  )
}
