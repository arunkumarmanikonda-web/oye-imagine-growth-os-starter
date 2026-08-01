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

export type CommercialOnboardingWorkspace = {
  intake: OnboardingIntakeDraft
  onboardingProgress: OnboardingProgressSummary
  kycVerification: CommercialKycVerificationSummary
  agreementBlueprint: ReturnType<typeof buildAgreementSignupBlueprint>
  activationSummary: ReturnType<typeof buildCommercialActivationSummary>
  continuitySummary: ReturnType<typeof buildCommercialContinuitySummary>
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
    brandName: intake.companyName,
    contractSigned: input.contractSigned ?? false,
    esignProviderReady: input.esignProviderReady ?? false,
    subscriptionActivated: input.subscriptionActive ?? false,
    invoiceProfileReady:
      input.invoiceProfileReady ?? (onboardingProgress.readyForReview && kycVerification.status === 'verified'),
    paymentMethodReady: input.paymentMethodReady ?? false,
    approvalPolicyReady: input.approvalPolicyReady ?? false,
  })

  const continuitySummary = buildCommercialContinuitySummary({
    brandName: intake.companyName,
    onboardingCompleted: onboardingProgress.readyForReview,
    strategyGenerated: input.strategyGenerated ?? false,
    strategyApproved: input.strategyApproved ?? false,
    contractSigned: input.contractSigned ?? false,
    subscriptionActive: input.subscriptionActive ?? false,
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
    agreementBlueprint,
    activationSummary,
    continuitySummary,
    readyForCommercialReview:
      onboardingProgress.readyForReview &&
      kycVerification.status === 'verified' &&
      agreementBlueprint.status === 'intake_ready',
  }
}
