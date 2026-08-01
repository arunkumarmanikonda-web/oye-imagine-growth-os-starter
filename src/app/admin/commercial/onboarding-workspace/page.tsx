import React from 'react'
import { buildCommercialOnboardingWorkspace } from '@/lib/pilot/commercial-onboarding-workspace'
import type { ServiceKey } from '@/lib/pilot/onboarding-types'
import type {
  CommercialBillingModel,
  CommercialPaymentTerm,
  CommercialScopeLane,
} from '@/lib/recovery/commercial-agreement-types'

type SearchParamValue = string | string[] | undefined
type SearchParamsShape = Record<string, SearchParamValue>

function firstValue(value: SearchParamValue): string | null {
  if (Array.isArray(value)) return value[0]?.trim() || null
  return value?.trim() || null
}

function manyValues(value: SearchParamValue): string[] {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean)
  return value?.trim() ? [value.trim()] : []
}

function toBoolean(value: SearchParamValue, fallback = false): boolean {
  const normalized = firstValue(value)
  if (normalized == null) return fallback
  return ['1', 'true', 'yes', 'y'].includes(normalized.toLowerCase())
}

function toNumber(value: SearchParamValue, fallback = 0): number {
  const normalized = firstValue(value)
  if (normalized == null || normalized === '') return fallback
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'yellow' | 'red'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : tone === 'yellow'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-rose-100 text-rose-800 border-rose-200'

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClass}`}
    >
      {label}
    </span>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function BulletList({
  items,
  emptyLabel = 'None',
  tone = 'default',
}: {
  items: string[]
  emptyLabel?: string
  tone?: 'default' | 'danger'
}) {
  if (!items.length) {
    return <p className="font-medium">{emptyLabel}</p>
  }

  const textClass = tone === 'danger' ? 'text-rose-700' : 'text-slate-700'

  return (
    <ul className={`space-y-1 text-sm ${textClass}`}>
      {items.map((item) => (
        <li key={item}>• {item}</li>
      ))}
    </ul>
  )
}

export default async function AdminCommercialOnboardingWorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsShape>
}) {
  const resolved = (await searchParams) ?? {}

  const companyName = firstValue(resolved.companyName) || 'Unknown company'
  const workspace = buildCommercialOnboardingWorkspace({
    intakeId: firstValue(resolved.intakeId) || 'intake_demo',
    tenantId: firstValue(resolved.tenantId) || 'tenant_demo',
    companyName,
    legalName: firstValue(resolved.legalName),
    websiteUrl: firstValue(resolved.websiteUrl),
    industry: firstValue(resolved.industry),
    countriesServed: manyValues(resolved.country),
    servicesRequested: manyValues(resolved.service) as ServiceKey[],
    autonomyLevel: toNumber(resolved.autonomyLevel, 1) as 0 | 1 | 2 | 3 | 4,
    billingCurrency: firstValue(resolved.billingCurrency) || 'INR',
    clientTradeName: firstValue(resolved.clientTradeName) || companyName,
    clientPrimaryContactName: firstValue(resolved.clientPrimaryContactName),
    clientPrimaryContactEmail: firstValue(resolved.clientPrimaryContactEmail),
    clientGstin: firstValue(resolved.clientGstin),
    businessEmail: firstValue(resolved.businessEmail),
    domainVerified: toBoolean(resolved.domainVerified),
    businessEmailVerified: toBoolean(resolved.businessEmailVerified),
    authorizedRepresentativeName: firstValue(resolved.authorizedRepresentativeName),
    authorizedRepresentativeEmail: firstValue(resolved.authorizedRepresentativeEmail),
    authorizedRepresentativeVerified: toBoolean(resolved.authorizedRepresentativeVerified),
    billingIdentityConfirmed: toBoolean(resolved.billingIdentityConfirmed),
    requestedLanes: (manyValues(resolved.lane).length
      ? manyValues(resolved.lane)
      : ['growth_strategy']) as CommercialScopeLane[],
    billingModel: (firstValue(resolved.billingModel) || 'monthly_retainer') as CommercialBillingModel,
    baseFeeInr: toNumber(resolved.baseFeeInr, 0),
    paymentTerm: (firstValue(resolved.paymentTerm) || 'net_15') as CommercialPaymentTerm,
    contractSigned: toBoolean(resolved.contractSigned),
    esignProviderReady: toBoolean(resolved.esignProviderReady),
    subscriptionActive: toBoolean(resolved.subscriptionActive),
    invoiceProfileReady: toBoolean(resolved.invoiceProfileReady),
    paymentMethodReady: toBoolean(resolved.paymentMethodReady),
    approvalPolicyReady: toBoolean(resolved.approvalPolicyReady),
    strategyGenerated: toBoolean(resolved.strategyGenerated),
    strategyApproved: toBoolean(resolved.strategyApproved),
    invoiceStatus: (firstValue(resolved.invoiceStatus) || 'not_issued') as
      | 'not_issued'
      | 'issued'
      | 'paid'
      | 'overdue',
    approvalOpenCount: toNumber(resolved.approvalOpenCount, 0),
    auditCoverage: toNumber(resolved.auditCoverage, 0),
    mediaBalanceAmount: toNumber(resolved.mediaBalanceAmount, 0),
    currency: firstValue(resolved.currency) || 'INR',

    esignCredentialsPresent: toBoolean(resolved.esignCredentialsPresent),
    esignBusinessVerified: toBoolean(resolved.esignBusinessVerified),
    esignLiveAccountConnected: toBoolean(resolved.esignLiveAccountConnected),
    esignWebhookConfigured: toBoolean(resolved.esignWebhookConfigured),
    esignCallbackVerified: toBoolean(resolved.esignCallbackVerified),

    paymentGatewayCredentialsPresent: toBoolean(resolved.paymentGatewayCredentialsPresent),
    paymentGatewayBusinessVerified: toBoolean(resolved.paymentGatewayBusinessVerified),
    paymentGatewayLiveAccountConnected: toBoolean(resolved.paymentGatewayLiveAccountConnected),
    paymentGatewayWebhookConfigured: toBoolean(resolved.paymentGatewayWebhookConfigured),
    paymentGatewayCallbackVerified: toBoolean(resolved.paymentGatewayCallbackVerified),
  })

  const missingFields = workspace.onboardingProgress.missingFields
  const commercialReviewBlockers = workspace.commercialReviewBlockers
  const continuityBlockers = workspace.continuitySummary.blockers
  const kycMissingChecks = workspace.kycVerification.missingChecks
  const kycVerifiedChecks = workspace.kycVerification.verifiedChecks
  const agreementClientGstin =
    workspace.agreementBlueprint.clientProfile.gstin === 'pending_client_tax_profile'
      ? 'Pending'
      : workspace.agreementBlueprint.clientProfile.gstin
  const providerStatuses = workspace.providerReadiness.requiredProviders.map(
    (provider) => `${provider.provider}: ${provider.status}`,
  )

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
            Mega Batch B1
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold">{workspace.intake.companyName}</h1>
            <StatusPill
              label={workspace.readyForCommercialReview ? 'Commercial review ready' : 'Commercial review blocked'}
              tone={workspace.readyForCommercialReview ? 'green' : 'red'}
            />
            <StatusPill
              label={`KYC ${workspace.kycVerification.status}`}
              tone={workspace.kycVerification.status === 'verified' ? 'green' : 'yellow'}
            />
            <StatusPill
              label={`Providers ${workspace.providerReadiness.status}`}
              tone={workspace.providerReadiness.status === 'ready' ? 'green' : 'yellow'}
            />
            <StatusPill
              label={`Activation ${workspace.activationSummary.status}`}
              tone={workspace.activationSummary.status === 'ready' ? 'green' : 'yellow'}
            />
            <StatusPill
              label={workspace.continuitySummary.readyForActivation ? 'Continuity ready' : 'Continuity blocked'}
              tone={workspace.continuitySummary.readyForActivation ? 'green' : 'yellow'}
            />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Admin commercial onboarding workspace with onboarding completeness, KYC proof gating,
            provider readiness, agreement intake readiness, activation controls, and continuity blockers in one governed view.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Onboarding progress">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Tenant</dt>
                <dd className="font-medium">{workspace.intake.tenantId}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Industry</dt>
                <dd className="font-medium">{workspace.intake.industry || 'Pending'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Website</dt>
                <dd className="font-medium">{workspace.intake.websiteUrl || 'Pending'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Billing currency</dt>
                <dd className="font-medium">{workspace.intake.billingCurrency}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Services requested</dt>
                <dd className="font-medium">
                  {workspace.intake.servicesRequested.length
                    ? workspace.intake.servicesRequested.join(', ')
                    : 'None captured'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Missing fields</dt>
                <dd className="font-medium text-rose-700">
                  {missingFields.length ? missingFields.join(', ') : 'None'}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="KYC verification">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">{workspace.kycVerification.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Client GSTIN</dt>
                <dd className="font-medium">{workspace.kycVerification.clientGstin || 'Pending'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Business email</dt>
                <dd className="font-medium">{workspace.kycVerification.businessEmail || 'Pending'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Website</dt>
                <dd className="font-medium">{workspace.kycVerification.websiteUrl || 'Pending'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Authorized representative</dt>
                <dd className="font-medium">
                  {workspace.kycVerification.authorizedRepresentativeName || 'Pending'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Authorized rep email</dt>
                <dd className="font-medium">
                  {workspace.kycVerification.authorizedRepresentativeEmail || 'Pending'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Verified checks</dt>
                <dd className="font-medium">
                  <BulletList items={kycVerifiedChecks} emptyLabel="None" />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Missing checks</dt>
                <dd className="font-medium">
                  <BulletList items={kycMissingChecks} tone="danger" emptyLabel="None" />
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Commercial review blockers">
            <dl className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">
                  {workspace.readyForCommercialReview ? 'ready' : 'blocked'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Blockers</dt>
                <dd className="font-medium">
                  <BulletList items={commercialReviewBlockers} tone="danger" emptyLabel="None" />
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Provider readiness">
            <dl className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">{workspace.providerReadiness.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Required providers</dt>
                <dd className="font-medium">
                  <BulletList items={providerStatuses} emptyLabel="None" />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Provider blockers</dt>
                <dd className="font-medium">
                  <BulletList items={workspace.providerReadiness.blockers} tone="danger" emptyLabel="None" />
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Commercial agreement">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Client legal name</dt>
                <dd className="font-medium">
                  {workspace.agreementBlueprint.clientProfile.legalName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Client GSTIN</dt>
                <dd className="font-medium">{agreementClientGstin}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Billing model</dt>
                <dd className="font-medium">{firstValue(resolved.billingModel) || 'monthly_retainer'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Payment term</dt>
                <dd className="font-medium">{firstValue(resolved.paymentTerm) || 'net_15'}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Activation controls">
            <dl className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">{workspace.activationSummary.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Blockers</dt>
                <dd className="font-medium">
                  <BulletList items={workspace.activationSummary.blockers} tone="danger" emptyLabel="None" />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Next action</dt>
                <dd className="font-medium">{workspace.activationSummary.nextAction}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Continuity blockers">
            <dl className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">
                  {workspace.continuitySummary.readyForActivation ? 'ready' : 'blocked'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Blockers</dt>
                <dd className="font-medium">
                  <BulletList items={continuityBlockers} tone="danger" emptyLabel="None" />
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}

