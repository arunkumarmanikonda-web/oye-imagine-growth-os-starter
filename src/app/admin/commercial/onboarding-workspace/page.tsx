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
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClass}`}>
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
  })

  const missingFields = workspace.onboardingProgress.missingFields
  const blockers = workspace.continuitySummary.blockers

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
              label={`Activation ${workspace.activationSummary.status}`}
              tone={workspace.activationSummary.status === 'ready' ? 'green' : 'yellow'}
            />
            <StatusPill
              label={workspace.continuitySummary.readyForActivation ? 'Continuity ready' : 'Continuity blocked'}
              tone={workspace.continuitySummary.readyForActivation ? 'green' : 'yellow'}
            />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Admin commercial onboarding workspace: onboarding completeness, agreement intake readiness,
            activation controls, and continuity blockers in one governed view.
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

          <SectionCard title="Commercial agreement">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Blueprint status</dt>
                <dd className="font-medium">{workspace.agreementBlueprint.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Payment term</dt>
                <dd className="font-medium">{firstValue(resolved.paymentTerm) || 'net_15'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Billing model</dt>
                <dd className="font-medium">{firstValue(resolved.billingModel) || 'monthly_retainer'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Base fee (INR)</dt>
                <dd className="font-medium">{toNumber(resolved.baseFeeInr, 0)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Requested lanes</dt>
                <dd className="font-medium">{workspace.agreementBlueprint.requestedLanes.join(', ')}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Activation controls">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">{workspace.activationSummary.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Activation note</dt>
                <dd className="font-medium">
                  {workspace.activationSummary.status === 'ready'
                    ? 'None'
                    : 'See onboarding missing fields and continuity blockers below'}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Continuity and blockers">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Ready for activation</dt>
                <dd className="font-medium">
                  {workspace.continuitySummary.readyForActivation ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Invoice status</dt>
                <dd className="font-medium">{firstValue(resolved.invoiceStatus) || 'not_issued'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Approval open count</dt>
                <dd className="font-medium">{toNumber(resolved.approvalOpenCount, 0)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Audit coverage</dt>
                <dd className="font-medium">{toNumber(resolved.auditCoverage, 0)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Blockers</dt>
                <dd className="font-medium text-amber-700">
                  {blockers.length ? blockers.join(', ') : 'None'}
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}