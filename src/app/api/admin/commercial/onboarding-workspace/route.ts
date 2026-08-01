import { NextResponse } from 'next/server'
import { buildCommercialOnboardingWorkspace } from '@/lib/pilot/commercial-onboarding-workspace'
import type { ServiceKey } from '@/lib/pilot/onboarding-types'
import type {
  CommercialBillingModel,
  CommercialPaymentTerm,
  CommercialScopeLane,
} from '@/lib/recovery/commercial-agreement-types'

function toBoolean(value: string | null, fallback = false): boolean {
  if (value == null) return fallback
  return ['1', 'true', 'yes', 'y'].includes(value.trim().toLowerCase())
}

function toNumber(value: string | null, fallback = 0): number {
  if (value == null || value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const tenantId = searchParams.get('tenantId')?.trim() || 'tenant_demo'
  const companyName = searchParams.get('companyName')?.trim() || 'Unknown company'
  const legalName = searchParams.get('legalName')?.trim() || null
  const websiteUrl = searchParams.get('websiteUrl')?.trim() || null
  const industry = searchParams.get('industry')?.trim() || null
  const countriesServed = searchParams.getAll('country')
  const servicesRequested = searchParams.getAll('service') as ServiceKey[]
  const requestedLanes = (searchParams.getAll('lane').length
    ? searchParams.getAll('lane')
    : ['growth_strategy']) as CommercialScopeLane[]

  const workspace = buildCommercialOnboardingWorkspace({
    intakeId: searchParams.get('intakeId')?.trim() || 'intake_demo',
    tenantId,
    companyName,
    legalName,
    websiteUrl,
    industry,
    countriesServed,
    servicesRequested,
    autonomyLevel: toNumber(searchParams.get('autonomyLevel'), 1) as 0 | 1 | 2 | 3 | 4,
    billingCurrency: searchParams.get('billingCurrency')?.trim() || 'INR',
    clientTradeName: searchParams.get('clientTradeName')?.trim() || companyName,
    clientPrimaryContactName: searchParams.get('clientPrimaryContactName')?.trim() || null,
    clientPrimaryContactEmail: searchParams.get('clientPrimaryContactEmail')?.trim() || null,
    clientGstin: searchParams.get('clientGstin')?.trim() || null,
    businessEmail: searchParams.get('businessEmail')?.trim() || null,
    domainVerified: toBoolean(searchParams.get('domainVerified')),
    businessEmailVerified: toBoolean(searchParams.get('businessEmailVerified')),
    authorizedRepresentativeName:
      searchParams.get('authorizedRepresentativeName')?.trim() || null,
    authorizedRepresentativeEmail:
      searchParams.get('authorizedRepresentativeEmail')?.trim() || null,
    authorizedRepresentativeVerified: toBoolean(
      searchParams.get('authorizedRepresentativeVerified'),
    ),
    billingIdentityConfirmed: toBoolean(searchParams.get('billingIdentityConfirmed')),
    requestedLanes,
    billingModel: (searchParams.get('billingModel')?.trim() || 'monthly_retainer') as CommercialBillingModel,
    baseFeeInr: toNumber(searchParams.get('baseFeeInr'), 0),
    paymentTerm: (searchParams.get('paymentTerm')?.trim() || 'net_15') as CommercialPaymentTerm,
    contractSigned: toBoolean(searchParams.get('contractSigned')),
    esignProviderReady: toBoolean(searchParams.get('esignProviderReady')),
    subscriptionActive: toBoolean(searchParams.get('subscriptionActive')),
    invoiceProfileReady: toBoolean(searchParams.get('invoiceProfileReady')),
    paymentMethodReady: toBoolean(searchParams.get('paymentMethodReady')),
    approvalPolicyReady: toBoolean(searchParams.get('approvalPolicyReady')),
    strategyGenerated: toBoolean(searchParams.get('strategyGenerated')),
    strategyApproved: toBoolean(searchParams.get('strategyApproved')),
    invoiceStatus: (searchParams.get('invoiceStatus')?.trim() || 'not_issued') as
      | 'not_issued'
      | 'issued'
      | 'paid'
      | 'overdue',
    approvalOpenCount: toNumber(searchParams.get('approvalOpenCount'), 0),
    auditCoverage: toNumber(searchParams.get('auditCoverage'), 0),
    mediaBalanceAmount: toNumber(searchParams.get('mediaBalanceAmount'), 0),
    currency: searchParams.get('currency')?.trim() || 'INR',

    esignCredentialsPresent: toBoolean(searchParams.get('esignCredentialsPresent')),
    esignBusinessVerified: toBoolean(searchParams.get('esignBusinessVerified')),
    esignLiveAccountConnected: toBoolean(searchParams.get('esignLiveAccountConnected')),
    esignWebhookConfigured: toBoolean(searchParams.get('esignWebhookConfigured')),
    esignCallbackVerified: toBoolean(searchParams.get('esignCallbackVerified')),

    paymentGatewayCredentialsPresent: toBoolean(searchParams.get('paymentGatewayCredentialsPresent')),
    paymentGatewayBusinessVerified: toBoolean(searchParams.get('paymentGatewayBusinessVerified')),
    paymentGatewayLiveAccountConnected: toBoolean(searchParams.get('paymentGatewayLiveAccountConnected')),
    paymentGatewayWebhookConfigured: toBoolean(searchParams.get('paymentGatewayWebhookConfigured')),
    paymentGatewayCallbackVerified: toBoolean(searchParams.get('paymentGatewayCallbackVerified')),
  })

  return NextResponse.json({
    ok: true,
    workspace,
    derived: {
      commercialReviewStatus: workspace.readyForCommercialReview ? 'ready' : 'blocked',
      activationStatus: workspace.activationSummary.status,
      continuityReady: workspace.continuitySummary.readyForActivation,
      missingOnboardingFields: workspace.onboardingProgress.missingFields,
      continuityBlockers: workspace.continuitySummary.blockers,
      kycStatus: workspace.kycVerification.status,
      kycMissingChecks: workspace.kycVerification.missingChecks,
      agreementClientGstin: workspace.agreementBlueprint.clientProfile.gstin,
      agreementClientGstinReady:
        workspace.agreementBlueprint.clientProfile.gstin !== 'pending_client_tax_profile',
      providerReadinessStatus: workspace.providerReadiness.status,
      providerReadinessBlockers: workspace.providerReadiness.blockers,
    },
  })
}
