export type LandingPagePublicationInput = {
  brandName: string;
  locale: string;
  pageSlug: string;
  qaPassed: boolean;
  approvalRequired: boolean;
  approvalGranted: boolean;
  assetBundle: string[];
};

export type LandingPagePublicationSummary = {
  publicationStatus: 'ready' | 'blocked';
  blockers: string[];
  assetCount: number;
};

export type CampaignPackageInput = {
  brandName: string;
  channel: 'google' | 'meta' | 'linkedin' | 'email';
  objective: string;
  assets: string[];
  copyVariants: string[];
  targetingSummary: {
    audienceDefined: boolean;
    geoDefined: boolean;
    budgetDefined: boolean;
  };
};

export type CampaignPackageSummary = {
  packageStatus: 'ready' | 'incomplete';
  assetCount: number;
  copyVariantCount: number;
  missingElements: string[];
};

export type ChannelPublishReadinessInput = {
  brandName: string;
  channel: 'landing_page' | 'google' | 'meta' | 'linkedin' | 'email';
  qaChecks: Array<{
    name: string;
    passed: boolean;
  }>;
  requiredFieldsComplete: boolean;
};

export type ChannelPublishReadinessSummary = {
  qaStatus: 'ready' | 'blocked';
  blockers: string[];
  nextAction: string;
};

export type ApprovalBoundExecutionInput = {
  brandName: string;
  channel: 'google' | 'meta' | 'linkedin' | 'email' | 'landing_page';
  requiresApproval: boolean;
  approvalGranted: boolean;
  spendGuardrailStatus: 'clear' | 'blocked';
  publishReady: boolean;
};

export type ApprovalBoundExecutionSummary = {
  decision: 'approved' | 'hold';
  blockers: string[];
};

export type ProofExecutionPackageInput = {
  brandName: string;
  channel: 'google' | 'meta' | 'linkedin' | 'email' | 'landing_page';
  includedAssets: string[];
  includedChecks: string[];
  destinationUrls: string[];
};

export type ProofExecutionPackageSummary = {
  packageStatus: 'ready' | 'incomplete';
  missingElements: string[];
  includedAssetCount: number;
};