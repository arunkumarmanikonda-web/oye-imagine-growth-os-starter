import Link from 'next/link'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { getClientActivation } from '@/lib/commercial/activation-runtime'
import { activationBlockingReason, type ClientActivationState } from '@/lib/commercial/client-activation-journey'

const steps: Array<{ state: ClientActivationState; label: string; detail: string }> = [
  { state: 'brand_learning', label: 'Brand learning', detail: 'Oye reads the business story, website, category, audience and available brand evidence.' },
  { state: 'brand_plan_ready_locked', label: 'Private growth plan', detail: 'A strategy can be prepared internally, but it remains locked until commercial activation is complete.' },
  { state: 'kyc_pending', label: 'KYC', detail: 'Company and authorised-signatory details are verified before the legal agreement is issued.' },
  { state: 'agreement_generated', label: 'Agreement', detail: 'The contracted modules, scope, commercial terms and India-format agreement are generated from approved templates.' },
  { state: 'esign_sent', label: 'Digital signature', detail: 'The agreement is sent for digital execution and the signed evidence is captured.' },
  { state: 'payment_pending', label: 'Subscription payment', detail: 'Monthly or annual payment and, where supported, recurring mandate are collected after signature.' },
  { state: 'invoice_issued', label: 'Tax invoice', detail: 'Payment evidence is reconciled and the invoice is issued before activation.' },
  { state: 'active', label: 'Growth OS active', detail: 'The signed modules, reporting and governed execution become available to authorised users.' },
]

const stateOrder: ClientActivationState[] = [
  'signup_completed','brand_learning','brand_plan_ready_locked','kyc_pending','kyc_verified','agreement_generated','esign_sent','agreement_signed','payment_pending','payment_processing','payment_successful','invoice_issued','active','suspended','cancelled',
]

export default async function ActivationPage() {
  const identity = await requireWorkspaceIdentity({ redirectTo: '/onboarding/activation' })
  const journey = await getClientActivation({ tenantId: identity.membership.tenant_id, workspaceId: identity.membership.workspace_id! })
  if (!journey) {
    return <main className="activation-reconcile"><section><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /><p className="activation-kicker">Account reconciliation</p><h1>Your workspace is being reconciled.</h1><p>We could not find the commercial activation journey for this workspace. No paid module has been opened. Oye support can reconcile the account without exposing another customer&apos;s data.</p></section></main>
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
    <main className="activation-page">
      <div className="activation-shell">
        <header className="activation-header">
          <div className="activation-topline"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /><form action="/api/auth/logout" method="post"><button className="activation-signout">Sign out</button></form></div>
          <p className="activation-kicker">Private onboarding · {plan}</p>
          <h1>Oye learns the brand before the operating system opens.</h1>
          <p className="activation-lead">Strategy can be prepared while onboarding progresses, but paid and high-impact capabilities are not released early. KYC, signed scope, payment evidence and invoice issuance are part of the activation chain.</p>
          {reason ? <div className="activation-gate">Current gate: {reason}</div> : null}
        </header>

        <section>
          <header className="activation-section-head"><p>Activation sequence</p><h2>Eight controlled steps from brand learning to governed operations.</h2></header>
          <div className="activation-steps">
            {steps.map((step, index) => {
              const stepIndex = stateOrder.indexOf(step.state)
              const complete = currentIndex > stepIndex || currentState === 'active'
              const current = currentState === step.state || (step.state === 'kyc_pending' && currentState === 'kyc_verified') || (step.state === 'agreement_generated' && ['esign_sent','agreement_signed'].includes(currentState)) || (step.state === 'payment_pending' && ['payment_processing','payment_successful'].includes(currentState))
              const stepState = complete ? 'complete' : current ? 'current' : 'upcoming'
              return <article key={step.state} className="activation-step" data-step-state={stepState}><span className="activation-step-index">{complete ? '✓' : index + 1}</span><div><h3>{step.label}</h3><p>{step.detail}</p></div></article>
            })}
          </div>
        </section>

        <section className="activation-help">
          <div><small>What you can do now</small><h2>Keep teaching Oye while activation work progresses.</h2><p>Brand evidence, KYC inputs and contract steps can move in parallel without exposing paid modules or a locked strategy prematurely.</p></div>
          <Link href="/contact?interest=activation">Need help with activation? ↗</Link>
        </section>
      </div>
    </main>
  )
}
