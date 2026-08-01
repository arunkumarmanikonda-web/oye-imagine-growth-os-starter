import type { CredentialStatusSummary } from '@/lib/activation/activation-types'
import {
  buildCredentialStatusSummary,
  providerReady,
} from '@/lib/activation/credential-status'
import { buildAgreementSignupBlueprint } from '@/lib/recovery/commercial-agreement-foundation'
import type {
  CommercialBillingModel,
  CommercialPaymentTerm,
  CommercialScopeLane,
} from '@/lib/recovery/commercial-agreement-types'
import { buildCommercialActivationSummary } from './commercial-activation-chain'
import { buildCommercialContinuitySummary } from './commercial-continuity'
import { createOnboardingIntakeDraft, summarizeOnboardingProgress } from './onboarding-service'
import type {
  OnboardingIntakeDraft,
  OnboardingProgressSummary,
  ServiceKey,
} from './onboarding-types'

export type CommercialOnboardingWorkspaceInput = {
  intakeId: string
  tenantId: string
  companyName: string
  legalName?: string | null
  websiteUrl?: string | null
  industry?: string | null
  countriesServed?: string[]
  servicesRequested?: ServiceKey[]
  autonomyLevel?: 0 | 1 | 2 | 3 | 4
  billingCurrency?: string
  intakePayload?: Record<string, unknown>
  clientTradeName?: string | null
  clientPrimaryContactName?: string | null
  clientPrimaryContactEmail?: string | null
  clientGstin?: string | null
  businessEmail?: string | null
  domainVerified?: boolean
  businessEmailVerified?: boolean
  authorizedRepresentativeName?: string | null
  authorizedRepresentativeEmail?: string | null
  authorizedRepresentativeVerified?: boolean
  billingIdentityConfirmed?: boolean
  requestedLanes?: CommercialScopeLane[]
  billingModel?: CommercialBillingModel
  baseFeeInr?: number
  paymentTerm?: CommercialPaymentTerm
  contractSigned?: boolean
  esignProviderReady?: boolean
  subscriptionActive?: boolean
  invoiceProfileReady?: boolean
  paymentMethodReady?: boolean
  approvalPolicyReady?: boolean
  strategyGenerated?: boolean
  strategyApproved?: boolean
  invoiceStatus?: 'not_issued' | 'issued' | 'paid' | 'overdue'
  approvalOpenCount?: number
  auditCoverage?: number
  mediaBalanceAmount?: number
  currency?: string

  esignCredentialsPresent?: boolean
  esignBusinessVerified?: boolean
  esignLiveAccountConnected?: boolean
  esignWebhookConfigured?: boolean
  esignCallbackVerified?: boolean

  paymentGatewayCredentialsPresent?: boolean
  paymentGatewayBusinessVerified?: boolean
  paymentGatewayLiveAccountConnected?: boolean
  paymentGatewayWebhookConfigured?: boolean
  paymentGatewayCallbackVerified?: boolean
}

export type CommercialKycVerificationSummary = {
  status: 'verified' | 'pending'
  verifiedChecks: string[]
  missingChecks: string[]
  clientLegalName: string | null
  clientGstin: string | null
  businessEmail: string | null
  websiteUrl: string | null
  authorizedRepresentativeName: string | null
  authorizedRepresentativeEmail: string | null
  billingIdentityConfirmed: boolean
  domainVerified: boolean
  businessEmailVerified: boolean
  authorizedRepresentativeVerified: boolean
}

export type CommercialProviderReadinessSummary = {
  status: 'ready' | 'blocked'
  requiredProviders: CredentialStatusSummary[]
  blockers: string[]
}

export type CommercialOnboardingWorkspace = {
  intake: OnboardingIntakeDraft
  onboardingProgress: OnboardingProgressSummary
  kycVerification: CommercialKycVerificationSummary
  providerReadiness: CommercialProviderReadinessSummary
  agreementBlueprint: ReturnType<typeof buildAgreementSignupBlueprint>
  activationSummary: ReturnType<typeof buildCommercialActivationSummary>
  continuitySummary: ReturnType<typeof buildCommercialContinuitySummary>
  commercialReviewBlockers: string[]
  readyForCommercialReview: boolean
}

function buildCommercialKycVerificationSummary(
  input: CommercialOnboardingWorkspaceInput,
  intake: OnboardingIntakeDraft,
): CommercialKycVerificationSummary {
  const verifiedChecks: string[] = []
  const missingChecks: string[] = []

  const clientLegalName = input.legalName?.trim() || null
  const clientGstin = input.clientGstin?.trim() || null
  const businessEmail =
    input.businessEmail?.trim() ||
    input.clientPrimaryContactEmail?.trim() ||
    null
  const websiteUrl = intake.websiteUrl?.trim() || null
  const authorizedRepresentativeName =
    input.authorizedRepresentativeName?.trim() ||
    input.clientPrimaryContactName?.trim() ||
    null
  const authorizedRepresentativeEmail =
    input.authorizedRepresentativeEmail?.trim() ||
    input.clientPrimaryContactEmail?.trim() ||
    null

  if (clientLegalName) verifiedChecks.push('legalName')
  else missingChecks.push('legalName')

  if (clientGstin) verifiedChecks.push('clientGstin')
  else missingChecks.push('clientGstin')

  if (websiteUrl) {
    verifiedChecks.push('websiteUrl')
    if (input.domainVerified) verifiedChecks.push('domain verification')
    else missingChecks.push('domain verification')
  } else {
    missingChecks.push('websiteUrl')
    missingChecks.push('domain verification')
  }

  if (businessEmail) {
    verifiedChecks.push('business email')
    if (input.businessEmailVerified) verifiedChecks.push('business email verification')
    else missingChecks.push('business email verification')
  } else {
    missingChecks.push('business email')
    missingChecks.push('business email verification')
  }

  if (authorizedRepresentativeName && authorizedRepresentativeEmail) {
    verifiedChecks.push('authorized representative')
    if (input.authorizedRepresentativeVerified) {
      verifiedChecks.push('authorized representative verification')
    } else {
      missingChecks.push('authorized representative verification')
    }
  } else {
    missingChecks.push('authorized representative')
    missingChecks.push('authorized representative verification')
  }

  if (input.billingIdentityConfirmed) verifiedChecks.push('billing identity')
  else missingChecks.push('billing identity')

  return {
    status: missingChecks.length === 0 ? 'verified' : 'pending',
    verifiedChecks,
    missingChecks,
    clientLegalName,
    clientGstin,
    businessEmail,
    websiteUrl,
    authorizedRepresentativeName,
    authorizedRepresentativeEmail,
    billingIdentityConfirmed: input.billingIdentityConfirmed ?? false,
    domainVerified: input.domainVerified ?? false,
    businessEmailVerified: input.businessEmailVerified ?? false,
    authorizedRepresentativeVerified: input.authorizedRepresentativeVerified ?? false,
  }
}

function buildCommercialProviderReadinessSummary(
  input: CommercialOnboardingWorkspaceInput,
): CommercialProviderReadinessSummary {
  const esignSummary = buildCredentialStatusSummary({
    provider: 'esign',
    credentialsPresent: input.esignCredentialsPresent ?? input.esignProviderReady ?? false,
    appReviewApproved: false,
    businessVerified: input.esignBusinessVerified ?? input.esignProviderReady ?? false,
    liveAccountConnected: input.esignLiveAccountConnected ?? input.esignProviderReady ?? false,
    webhookConfigured: input.esignWebhookConfigured ?? input.esignProviderReady ?? false,
    callbackVerified: input.esignCallbackVerified ?? input.esignProviderReady ?? false,
  })

  const paymentGatewaySummary = buildCredentialStatusSummary({
    provider: 'payment_gateway',
    credentialsPresent: input.paymentGatewayCredentialsPresent ?? input.paymentMethodReady ?? false,
    appReviewApproved: false,
    businessVerified: input.paymentGatewayBusinessVerified ?? input.paymentMethodReady ?? false,
    liveAccountConnected: input.paymentGatewayLiveAccountConnected ?? input.paymentMethodReady ?? false,
    webhookConfigured: input.paymentGatewayWebhookConfigured ?? input.paymentMethodReady ?? false,
    callbackVerified: input.paymentGatewayCallbackVerified ?? input.paymentMethodReady ?? false,
  })

  const requiredProviders = [esignSummary, paymentGatewaySummary]
  const blockers = requiredProviders
    .filter((provider) => provider.status !== 'ready')
    .map((provider) => `${provider.provider}: ${provider.blockers.join(', ')}`)

  return {
    status: blockers.length === 0 ? 'ready' : 'blocked',
    requiredProviders,
    blockers,
  }
}

export function buildCommercialOnboardingWorkspace(
  input: CommercialOnboardingWorkspaceInput,
): CommercialOnboardingWorkspace {
  const intake = createOnboardingIntakeDraft({
    intakeId: input.intakeId,
    tenantId: input.tenantId,
    companyName: input.companyName,
    legalName: input.legalName ?? null,
    websiteUrl: input.websiteUrl ?? null,
    industry: input.industry ?? null,
    countriesServed: input.countriesServed ?? [],
    servicesRequested: input.servicesRequested ?? [],
    autonomyLevel: input.autonomyLevel ?? 1,
    billingCurrency: input.billingCurrency ?? 'INR',
    intakePayload: input.intakePayload ?? {},
  })

  const onboardingProgress = summarizeOnboardingProgress(intake)
  const kycVerification = buildCommercialKycVerificationSummary(input, intake)
  const providerReadiness = buildCommercialProviderReadinessSummary(input)

  const esignStatus =
    providerReadiness.requiredProviders.find((provider) => provider.provider === 'esign') ?? null
  const paymentGatewayStatus =
    providerReadiness.requiredProviders.find((provider) => provider.provider === 'payment_gateway') ?? null

  const esignProviderComputedReady = esignStatus ? providerReady(esignStatus) : false
  const paymentGatewayComputedReady = paymentGatewayStatus ? providerReady(paymentGatewayStatus) : false

  const agreementBlueprint = buildAgreementSignupBlueprint({
    clientLegalName: input.legalName?.trim() || input.companyName.trim(),
    clientTradeName: input.clientTradeName?.trim() || input.companyName.trim(),
    clientPrimaryContactName: input.clientPrimaryContactName?.trim() || 'Primary contact pending',
    clientPrimaryContactEmail: input.clientPrimaryContactEmail?.trim() || 'pending@example.com',
    clientGstin: input.clientGstin?.trim() || undefined,
    requestedLanes: input.requestedLanes ?? ['growth_strategy'],
    billingModel: input.billingModel ?? 'monthly_retainer',
    baseFeeInr: input.baseFeeInr ?? 0,
    paymentTerm: input.paymentTerm ?? 'net_15',
  })

  const activationSummary = buildCommercialActivationSummary({
    brandName: input.companyName,
    contractSigned: input.contractSigned ?? false,
    esignProviderReady: esignProviderComputedReady,
    subscriptionActivated: input.subscriptionActive ?? false,
    invoiceProfileReady: input.invoiceProfileReady ?? false,
    paymentMethodReady: paymentGatewayComputedReady,
    approvalPolicyReady: input.approvalPolicyReady ?? false,
  })

  const commercialReviewBlockers: string[] = []
  if (!onboardingProgress.readyForReview) {
    commercialReviewBlockers.push('Onboarding information is incomplete')
  }
  if (kycVerification.status !== 'verified') {
    commercialReviewBlockers.push('KYC verification is incomplete')
  }
  if (agreementBlueprint.status !== 'intake_ready') {
    commercialReviewBlockers.push('Commercial agreement intake is incomplete')
  }
  if (providerReadiness.status !== 'ready') {
    commercialReviewBlockers.push('Required providers are not production ready')
  }

  const continuitySummary = buildCommercialContinuitySummary({
    brandName: input.companyName,
    onboardingCompleted: onboardingProgress.readyForReview,
    contractSigned: input.contractSigned ?? false,
    subscriptionActive: input.subscriptionActive ?? false,
    strategyGenerated: input.strategyGenerated ?? false,
    strategyApproved: input.strategyApproved ?? false,
    invoiceStatus: input.invoiceStatus ?? 'not_issued',
    approvalOpenCount: input.approvalOpenCount ?? 0,
    auditCoverage: input.auditCoverage ?? 0,
    mediaBalanceAmount: input.mediaBalanceAmount ?? 0,
    currency: input.currency ?? input.billingCurrency ?? 'INR',
  })

  return {
    intake,
    onboardingProgress,
    kycVerification,
    providerReadiness,
    agreementBlueprint,
    activationSummary,
    continuitySummary,
    commercialReviewBlockers,
    readyForCommercialReview: commercialReviewBlockers.length === 0,
  }
}





