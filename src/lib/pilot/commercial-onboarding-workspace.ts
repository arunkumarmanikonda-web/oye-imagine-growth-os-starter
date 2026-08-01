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

export type CommercialOnboardingWorkspace = {
  intake: OnboardingIntakeDraft
  onboardingProgress: OnboardingProgressSummary
  agreementBlueprint: ReturnType<typeof buildAgreementSignupBlueprint>
  activationSummary: ReturnType<typeof buildCommercialActivationSummary>
  continuitySummary: ReturnType<typeof buildCommercialContinuitySummary>
  readyForCommercialReview: boolean
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

  const agreementBlueprint = buildAgreementSignupBlueprint({
    clientLegalName: input.legalName?.trim() || input.companyName.trim(),
    clientTradeName: input.clientTradeName?.trim() || input.companyName.trim(),
    clientPrimaryContactName: input.clientPrimaryContactName?.trim() || 'Primary contact pending',
    clientPrimaryContactEmail: input.clientPrimaryContactEmail?.trim() || 'pending@example.com',
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
    invoiceProfileReady: input.invoiceProfileReady ?? onboardingProgress.readyForReview,
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
    agreementBlueprint,
    activationSummary,
    continuitySummary,
    readyForCommercialReview:
      onboardingProgress.readyForReview &&
      agreementBlueprint.status === 'intake_ready',
  }
}