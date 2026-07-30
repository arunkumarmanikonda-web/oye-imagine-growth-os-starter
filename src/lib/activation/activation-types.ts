export type ProviderKey =
  | 'google_ads'
  | 'meta_marketing'
  | 'linkedin_marketing'
  | 'youtube'
  | 'ga4'
  | 'search_console'
  | 'google_business_profile'
  | 'payment_gateway'
  | 'esign'
  | 'whatsapp';

export type ProviderRequirement = {
  provider: ProviderKey;
  requiresCredentials: boolean;
  requiresAppReview: boolean;
  requiresBusinessVerification: boolean;
  requiresLiveAccount: boolean;
  notes: string[];
};

export type CredentialStatusInput = {
  provider: ProviderKey;
  credentialsPresent: boolean;
  appReviewApproved: boolean;
  businessVerified: boolean;
  liveAccountConnected: boolean;
  webhookConfigured: boolean;
  callbackVerified: boolean;
};

export type CredentialStatusSummary = {
  provider: ProviderKey;
  status: 'ready' | 'partial' | 'blocked';
  blockers: string[];
  readyChecks: string[];
};

export type DeploymentReadinessInput = {
  vercelDeploymentPassed: boolean;
  workspaceBrandingSmokePassed: boolean;
  validationPassed: boolean;
  requiredProviders: CredentialStatusSummary[];
};

export type DeploymentReadinessSummary = {
  overallStatus: 'ready' | 'blocked';
  blockerCount: number;
  blockers: string[];
  failedSystems: string[];
};

export type ProductionActivationInput = {
  brandName: string;
  autonomyMode:
    | 'observation'
    | 'draft'
    | 'approval_based'
    | 'guardrailed'
    | 'high_autonomy';
  deployment: DeploymentReadinessSummary;
  providerStatuses: CredentialStatusSummary[];
  legalSignoffReady: boolean;
  financeSignoffReady: boolean;
};

export type ProductionActivationSummary = {
  canProceed: boolean;
  blockers: string[];
  nextAction: string;
  externalDependencies: string[];
};

export type NeejeeActivationChecklistInput = {
  brandName: string;
  websiteConnected: boolean;
  analyticsConnected: boolean;
  adsConnected: boolean;
  searchConsoleConnected: boolean;
  approvalsConfigured: boolean;
  billingConfigured: boolean;
  strategyApproved: boolean;
};

export type NeejeeActivationChecklistSummary = {
  ready: boolean;
  completedItems: string[];
  missingItems: string[];
};