import Link from 'next/link'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { getClientActivation } from '@/lib/commercial/activation-runtime'
import { activationBlockingReason, type ClientActivationState } from '@/lib/commercial/client-activation-journey'

const steps: Array<{ state: ClientActivationState; label: string; detail: string }> = [
  { state: 'brand_learning', label: 'Brand learning', detail: 'Oye reads the business story, website, category, audience and available brand evidence.' },
  { state: 'brand_plan_ready_locked', label: 'Private growth plan', detail: 'A strategy can be prepared internally, but it remains locked until commercial activation is complete.' },
  { state: 'kyc_pending', label: 'KYC', detail: 'Company and authorized-signatory details are verified before the legal agreement is issued.' },
  { state: 'agreement_generated', label: 'Agreement', detail: 'The contracted modules, scope, commercial terms and India-format agreement are generated from approved templates.' },
  { state: 'esign_sent', label: 'Digital signature', detail: 'The agreement is sent for digital execution and the signed evidence is captured.' },
  { state: 'payment_pending', label: 'Subscription payment', detail: 'Monthly or annual payment and, where supported, recurring mandate are collected after signature.' },
  { state: 'invoice_issued', label: 'Tax invoice', detail: 'Payment evidence is reconciled and the invoice is issued before activation.' },
  { state: 'active', label: 'Growth OS active', detail: 'The signed modules, reporting and governed execution become available to authorized users.' },
]

const stateOrder: ClientActivationState[] = [
  'signup_completed','brand_learning','brand_plan_ready_locked','kyc_pending','kyc_verified','agreement_generated','esign_sent','agreement_signed','payment_pending','payment_processing','payment_successful','invoice_issued','active','suspended','cancelled',
]

export default async function ActivationPage() {
  const identity = await requireWorkspaceIdentity({ redirectTo: '/onboarding/activation' })
  const journey = await getClientActivation({ tenantId: identity.membership.tenant_id, workspaceId: identity.membership.workspace_id! })
  if (!journey) {
    return <main className="min-h-screen bg-[#e7e5e2] px-6 py-12 text-[#111]"><section className="mx-auto max-w-3xl rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-[8px_8px_0_#111]"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" className="h-10 w-auto" /><h1 className="mt-8 text-4xl font-black tracking-[-0.05em]">Your workspace is being reconciled.</h1><p className="mt-4 leading-8 text-black/65">We could not find the commercial activation journey for this workspace. No paid module has been opened. Oye support can reconcile the account without exposing another customer&apos;s data.</p></section></main>
  }

  const currentState = journey.state as ClientActivationState
  const currentIndex = stateOrder.indexOf(currentState)
  const plan = typeof journey.activation_metadata?.selectedPlan === 'string' ? journey.activation_metadata.selectedPlan : 'selected plan'
  const reason = activationBlockingReason({
    journeyId: journey.journey_id,
    tenantId: journey.tenant_id,
    workspaceId: journey.workspace_id,
    state: currentState,
    selectedModules: Array.isArray(journey.selected_modules) ? journey.selected_modules : [],
    billingCadence: journey.billing_cadence,
    brandPlanArtifactId: journey.brand_plan_artifact_id,
    kycCaseId: journey.kyc_case_id,
    agreementId: journey.agreement_id,
    esignEnvelopeId: journey.esign_envelope_id,
    paymentLinkId: journey.payment_link_id,
    recurringMandateId: journey.recurring_mandate_id,
    paymentId: journey.payment_id,
    invoiceId: journey.invoice_id,
    activatedAt: journey.activated_at,
  })

  return (
    <main className="min-h-screen bg-[#e7e5e2] px-5 py-10 text-[#111] md:px-8 md:py-14">
      <section className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[2.75rem] border-2 border-black bg-[#fdca5a] p-7 shadow-[10px_10px_0_#111] md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" className="h-11 w-auto" /><form action="/api/auth/logout" method="post"><button className="rounded-full border-2 border-black bg-white px-5 py-2.5 text-sm font-black">Sign out</button></form></div>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.24em]">Private onboarding · {plan}</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.065em] md:text-7xl">Oye is learning the brand. The operating system opens only when the commercial chain is complete.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/65">Your strategy may be prepared in the background, but it is not released early. KYC, signed scope, payment evidence and invoice issuance are part of activation, not paperwork after the fact.</p>
          {reason ? <div className="mt-7 rounded-2xl border-2 border-black bg-white px-5 py-4 text-sm font-black">Current gate: {reason}</div> : null}
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const stepIndex = stateOrder.indexOf(step.state)
            const complete = currentIndex > stepIndex || currentState === 'active'
            const current = currentState === step.state || (step.state === 'kyc_pending' && currentState === 'kyc_verified') || (step.state === 'agreement_generated' && ['esign_sent','agreement_signed'].includes(currentState)) || (step.state === 'payment_pending' && ['payment_processing','payment_successful'].includes(currentState))
            return <article key={step.state} className={`rounded-[2rem] border-2 border-black p-5 ${complete ? 'bg-[#c8f7d2]' : current ? 'bg-[#f7adc8]' : 'bg-white'}`}><span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-black text-xs font-black text-white">{complete ? '✓' : steps.indexOf(step) + 1}</span><h2 className="mt-4 text-xl font-black">{step.label}</h2><p className="mt-2 text-sm leading-6 text-black/60">{step.detail}</p></article>
          })}
        </section>

        <section className="mt-10 rounded-[2.25rem] border-2 border-black bg-black p-7 text-white md:flex md:items-center md:justify-between md:gap-8 md:p-9">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#fdca5a]">What you can do now</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Keep teaching Oye. Activation work can happen in parallel.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">Brand evidence, KYC inputs and contract steps can progress without exposing paid modules or a locked strategy prematurely.</p></div>
          <Link href="/contact?interest=activation" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-black md:mt-0">Need help with activation?</Link>
        </section>
      </section>
    </main>
  )
}
