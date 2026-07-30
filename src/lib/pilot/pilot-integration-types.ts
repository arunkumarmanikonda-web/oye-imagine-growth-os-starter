export type TenantFeatureFlags = {
  approvalsEnabled: boolean;
  subscriptionEnabled: boolean;
  invoiceEnabled: boolean;
  auditEnabled: boolean;
  competitorTrackingEnabled: boolean;
  activationEnabled: boolean;
};

export type TenantConfigurationInput = {
  tenantKey: string;
  brandName: string;
  workspaceSlug: string;
  region: string;
  defaultCurrency: string;
  features: TenantFeatureFlags;
};

export type TenantConfigurationSummary = {
  isReady: boolean;
  environment: 'pilot' | 'production_candidate';
  missingFields: string[];
  enabledFeatures: string[];
};

export type WebsiteAuditPageInput = {
  url: string;
  title: string;
  statusCode: number;
  hasAnalytics: boolean;
  hasMetaDescription: boolean;
  hasPrimaryCta: boolean;
};

export type WebsiteAuditIngestionInput = {
  brandName: string;
  pages: WebsiteAuditPageInput[];
};

export type WebsiteAuditSummary = {
  healthyPages: number;
  blockedPages: number;
  analyticsCoverage: number;
  conversionReadyPages: number;
  priorityFixes: string[];
};

export type CompetitorSnapshotInput = {
  name: string;
  positioning: string;
  offersAiSearch: boolean;
  offersPerformanceOps: boolean;
};

export type CompetitorLandscapeInput = {
  brandName: string;
  competitors: CompetitorSnapshotInput[];
  ownStrengths: string[];
};

export type CompetitorLandscapeSummary = {
  strongestCompetitors: string[];
  parityGaps: string[];
  whiteSpace: string[];
};

export type CommercialActivationInput = {
  brandName: string;
  contractSigned: boolean;
  esignProviderReady: boolean;
  subscriptionActivated: boolean;
  invoiceProfileReady: boolean;
  paymentMethodReady: boolean;
  approvalPolicyReady: boolean;
};

export type CommercialActivationSummary = {
  status: 'ready' | 'blocked';
  blockers: string[];
  nextAction: string;
};

export type PilotStage =
  | 'onboarding'
  | 'audit'
  | 'strategy'
  | 'activation'
  | 'live';

export type PilotStateInput = {
  currentStage: PilotStage;
  auditReady: boolean;
  strategyReady: boolean;
  activationReady: boolean;
  liveSignalsHealthy: boolean;
};

export type PilotStateSummary = {
  currentStage: PilotStage;
  nextStage: PilotStage;
  canAdvance: boolean;
  blockers: string[];
};