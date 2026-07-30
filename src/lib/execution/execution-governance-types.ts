export type SearchSurface = 'seo' | 'aeo' | 'geo' | 'ai_search';
export type PublishDecision =
  | 'draft_only'
  | 'export_only'
  | 'approval_required'
  | 'publish_allowed'
  | 'blocked';

export interface SearchOptimizationInput {
  brandName: string;
  targetSurface: SearchSurface;
  primaryTopic: string;
  audience: string;
  offer: string;
  differentiators: string[];
  supportingKeywords: string[];
}

export interface SearchOptimizationBrief {
  briefName: string;
  targetSurface: SearchSurface;
  primaryQuery: string;
  supportingQueries: string[];
  answerEntities: string[];
  schemaRecommendations: string[];
  zeroClickOpportunities: string[];
}

export interface ChannelQaInput {
  brandName: string;
  channel: string;
  assetType: string;
  destinationUrl?: string;
  approvalStatus: 'draft' | 'approved';
  brandLocked: boolean;
  claims: string[];
  primaryCta?: string;
}

export interface ChannelQaResult {
  checks: string[];
  warnings: string[];
  blockers: string[];
  passed: boolean;
}

export interface PublishGuardrailInput {
  channel: string;
  requestedAction: 'draft' | 'export' | 'publish';
  commercialReady: boolean;
  approvalStatus: 'draft' | 'approved';
  approvalsOpenCount: number;
  estimatedSpend: number;
  channelAutomationSupported: boolean;
}

export interface PublishGuardrailDecision {
  decision: PublishDecision;
  requiresApproval: boolean;
  reasons: string[];
}

export interface ProofExecutionAssetInput {
  brandName: string;
  audience: string;
  offer: string;
  landingPageTitle: string;
  seoClusterTitle: string;
  socialTheme: string;
  campaignTheme: string;
  creativeHookCount: number;
}

export interface ProofExecutionAssetManifest {
  assets: Array<{
    assetType: 'landing_page' | 'seo_cluster' | 'social_calendar' | 'creative_set' | 'campaign_draft';
    title: string;
    summary: string;
  }>;
}