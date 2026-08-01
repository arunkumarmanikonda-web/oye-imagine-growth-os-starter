import {
  buildCommercialOnboardingWorkspace,
  type CommercialOnboardingWorkspace,
} from "@/lib/pilot/commercial-onboarding-workspace";
import type { ServiceKey } from "@/lib/pilot/onboarding-types";
import {
  buildOperatorLaunchActionBridge,
  type OperatorLaunchActionBridgeSummary,
} from "@/lib/ops/operator-launch-action-bridge";
import type {
  CommercialBillingModel,
  CommercialPaymentTerm,
  CommercialScopeLane,
} from "@/lib/recovery/commercial-agreement-types";

type QueryValue = string | string[] | null | undefined;

export type CommercialEvidenceBridgeSearchParamRecord = Record<string, QueryValue>;

export interface CommercialEvidenceSummary {
  companyName: string;
  commercialReviewStatus: "ready" | "blocked";
  commercialReviewBlockers: string[];
  providerReadinessStatus: "ready" | "blocked";
  providerReadinessBlockers: string[];
  activationStatus: "ready" | "blocked";
  activationBlockers: string[];
  continuityReady: boolean;
  continuityBlockers: string[];
  sharedBlockers: string[];
}

export interface CommercialEvidenceBridgeResult {
  workspace: CommercialOnboardingWorkspace | null;
  commercialEvidence: CommercialEvidenceSummary | null;
  operatorActionBridge: OperatorLaunchActionBridgeSummary | null;
  sharedBlockers: string[];
}

function firstValue(value: QueryValue): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }
  return value?.trim() || null;
}

function manyValues(value: QueryValue): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  return value?.trim() ? [value.trim()] : [];
}

function toBoolean(value: QueryValue, fallback = false): boolean {
  const normalized = firstValue(value);
  if (normalized == null) return fallback;
  return ["1", "true", "yes", "y"].includes(normalized.toLowerCase());
}

function toNumber(value: QueryValue, fallback = 0): number {
  const normalized = firstValue(value);
  if (normalized == null || normalized === "") return fallback;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasCommercialEvidenceSignal(
  searchParams: CommercialEvidenceBridgeSearchParamRecord,
): boolean {
  for (const key of ["companyName", "tenantId", "intakeId"]) {
    const value = firstValue(searchParams[key]);
    if (value) {
      return true;
    }
  }
  return false;
}

function buildSharedBlockers(workspace: CommercialOnboardingWorkspace): string[] {
  return Array.from(
    new Set([
      ...workspace.commercialReviewBlockers,
      ...workspace.activationSummary.blockers,
      ...workspace.continuitySummary.blockers,
    ]),
  );
}

function buildWorkspace(
  searchParams: CommercialEvidenceBridgeSearchParamRecord,
): CommercialOnboardingWorkspace | null {
  if (!hasCommercialEvidenceSignal(searchParams)) {
    return null;
  }

  const companyName = firstValue(searchParams.companyName) || "Unknown company";
  const tenantId = firstValue(searchParams.tenantId) || "tenant_demo";

  return buildCommercialOnboardingWorkspace({
    intakeId: firstValue(searchParams.intakeId) || "intake_demo",
    tenantId,
    companyName,
    legalName: firstValue(searchParams.legalName),
    websiteUrl: firstValue(searchParams.websiteUrl),
    industry: firstValue(searchParams.industry),
    countriesServed: manyValues(searchParams.country),
    servicesRequested: manyValues(searchParams.service) as ServiceKey[],
    autonomyLevel: toNumber(searchParams.autonomyLevel, 1) as 0 | 1 | 2 | 3 | 4,
    billingCurrency: firstValue(searchParams.billingCurrency) || "INR",
    clientTradeName: firstValue(searchParams.clientTradeName) || companyName,
    clientPrimaryContactName: firstValue(searchParams.clientPrimaryContactName),
    clientPrimaryContactEmail: firstValue(searchParams.clientPrimaryContactEmail),
    clientGstin: firstValue(searchParams.clientGstin),
    businessEmail: firstValue(searchParams.businessEmail),
    domainVerified: toBoolean(searchParams.domainVerified),
    businessEmailVerified: toBoolean(searchParams.businessEmailVerified),
    authorizedRepresentativeName: firstValue(searchParams.authorizedRepresentativeName),
    authorizedRepresentativeEmail: firstValue(searchParams.authorizedRepresentativeEmail),
    authorizedRepresentativeVerified: toBoolean(searchParams.authorizedRepresentativeVerified),
    billingIdentityConfirmed: toBoolean(searchParams.billingIdentityConfirmed),
    requestedLanes: (manyValues(searchParams.lane).length
      ? manyValues(searchParams.lane)
      : ["growth_strategy"]) as CommercialScopeLane[],
    billingModel: (firstValue(searchParams.billingModel) || "monthly_retainer") as CommercialBillingModel,
    baseFeeInr: toNumber(searchParams.baseFeeInr, 0),
    paymentTerm: (firstValue(searchParams.paymentTerm) || "net_15") as CommercialPaymentTerm,
    contractSigned: toBoolean(searchParams.contractSigned),
    esignProviderReady: toBoolean(searchParams.esignProviderReady),
    subscriptionActive: toBoolean(searchParams.subscriptionActive),
    invoiceProfileReady: toBoolean(searchParams.invoiceProfileReady),
    paymentMethodReady: toBoolean(searchParams.paymentMethodReady),
    approvalPolicyReady: toBoolean(searchParams.approvalPolicyReady),
    strategyGenerated: toBoolean(searchParams.strategyGenerated),
    strategyApproved: toBoolean(searchParams.strategyApproved),
    invoiceStatus: (firstValue(searchParams.invoiceStatus) || "not_issued") as
      | "not_issued"
      | "issued"
      | "paid"
      | "overdue",
    approvalOpenCount: toNumber(searchParams.approvalOpenCount, 0),
    auditCoverage: toNumber(searchParams.auditCoverage, 0),
    mediaBalanceAmount: toNumber(searchParams.mediaBalanceAmount, 0),
    currency: firstValue(searchParams.currency) || "INR",

    esignCredentialsPresent: toBoolean(searchParams.esignCredentialsPresent),
    esignBusinessVerified: toBoolean(searchParams.esignBusinessVerified),
    esignLiveAccountConnected: toBoolean(searchParams.esignLiveAccountConnected),
    esignWebhookConfigured: toBoolean(searchParams.esignWebhookConfigured),
    esignCallbackVerified: toBoolean(searchParams.esignCallbackVerified),

    paymentGatewayCredentialsPresent: toBoolean(searchParams.paymentGatewayCredentialsPresent),
    paymentGatewayBusinessVerified: toBoolean(searchParams.paymentGatewayBusinessVerified),
    paymentGatewayLiveAccountConnected: toBoolean(searchParams.paymentGatewayLiveAccountConnected),
    paymentGatewayWebhookConfigured: toBoolean(searchParams.paymentGatewayWebhookConfigured),
    paymentGatewayCallbackVerified: toBoolean(searchParams.paymentGatewayCallbackVerified),
  });
}

function buildCommercialEvidenceSummary(
  workspace: CommercialOnboardingWorkspace,
  sharedBlockers: string[],
): CommercialEvidenceSummary {
  return {
    companyName: workspace.intake.companyName,
    commercialReviewStatus: workspace.readyForCommercialReview ? "ready" : "blocked",
    commercialReviewBlockers: workspace.commercialReviewBlockers,
    providerReadinessStatus: workspace.providerReadiness.status,
    providerReadinessBlockers: workspace.providerReadiness.blockers,
    activationStatus: workspace.activationSummary.status,
    activationBlockers: workspace.activationSummary.blockers,
    continuityReady: workspace.continuitySummary.readyForActivation,
    continuityBlockers: workspace.continuitySummary.blockers,
    sharedBlockers,
  };
}

function buildOperatorBridgeSummary(
  searchParams: CommercialEvidenceBridgeSearchParamRecord,
  commercialEvidence: CommercialEvidenceSummary,
): OperatorLaunchActionBridgeSummary {
  return buildOperatorLaunchActionBridge({
    brandName: commercialEvidence.companyName,
    onboardingCompleted:
      toBoolean(searchParams.domainVerified) &&
      toBoolean(searchParams.businessEmailVerified) &&
      toBoolean(searchParams.authorizedRepresentativeVerified) &&
      toBoolean(searchParams.billingIdentityConfirmed),
    strategyGenerated: toBoolean(searchParams.strategyGenerated),
    strategyApproved: toBoolean(searchParams.strategyApproved),
    contractSigned: toBoolean(searchParams.contractSigned),
    subscriptionActive: toBoolean(searchParams.subscriptionActive),
    invoiceStatus: (firstValue(searchParams.invoiceStatus) || "not_issued") as
      | "not_issued"
      | "issued"
      | "paid"
      | "overdue",
    approvalOpenCount: toNumber(searchParams.approvalOpenCount, 0),
    auditCoverage: toNumber(searchParams.auditCoverage, 0),
    mediaBalanceAmount: toNumber(searchParams.mediaBalanceAmount, 0),
    currency: firstValue(searchParams.currency) || "INR",
    requestedLaunchDate: firstValue(searchParams.requestedLaunchDate) || undefined,
    commercialReviewStatus: commercialEvidence.commercialReviewStatus,
    providerReadinessStatus: commercialEvidence.providerReadinessStatus,
    activationStatus: commercialEvidence.activationStatus,
    continuityReady: commercialEvidence.continuityReady,
    sharedBlockers: commercialEvidence.sharedBlockers,
    pendingReports: toNumber(searchParams.pendingReports, 0),
    pendingCampaigns: toNumber(searchParams.pendingCampaigns, 0),
    pendingStrategyTasks: toNumber(
      searchParams.pendingStrategyTasks,
      toBoolean(searchParams.strategyApproved) ? 0 : 1,
    ),
  });
}

export function buildCommercialEvidenceBridgeFromSearchParamRecord(
  searchParams: CommercialEvidenceBridgeSearchParamRecord,
): CommercialEvidenceBridgeResult {
  const workspace = buildWorkspace(searchParams);

  if (!workspace) {
    return {
      workspace: null,
      commercialEvidence: null,
      operatorActionBridge: null,
      sharedBlockers: [],
    };
  }

  const sharedBlockers = buildSharedBlockers(workspace);
  const commercialEvidence = buildCommercialEvidenceSummary(workspace, sharedBlockers);
  const operatorActionBridge = buildOperatorBridgeSummary(searchParams, commercialEvidence);

  return {
    workspace,
    commercialEvidence,
    operatorActionBridge,
    sharedBlockers,
  };
}

function toRecord(searchParams: URLSearchParams): CommercialEvidenceBridgeSearchParamRecord {
  const result: CommercialEvidenceBridgeSearchParamRecord = {};
  const keys = new Set<string>();

  searchParams.forEach((_, key) => {
    keys.add(key);
  });

  for (const key of keys) {
    const values = searchParams.getAll(key).map((item) => item.trim()).filter(Boolean);
    if (values.length === 0) {
      result[key] = firstValue(searchParams.get(key));
    } else if (values.length === 1) {
      result[key] = values[0];
    } else {
      result[key] = values;
    }
  }

  return result;
}

export function buildCommercialEvidenceBridgeFromUrlSearchParams(
  searchParams: URLSearchParams,
): CommercialEvidenceBridgeResult {
  return buildCommercialEvidenceBridgeFromSearchParamRecord(toRecord(searchParams));
}