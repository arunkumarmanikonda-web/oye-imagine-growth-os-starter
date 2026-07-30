export type PlanningWindow = 'weekly' | 'monthly' | 'quarterly';
export type FunnelGoal = 'awareness' | 'consideration' | 'conversion' | 'retention';
export type DraftStatus = 'draft' | 'approved' | 'scheduled' | 'archived';
export type LandingPageStatus = 'draft' | 'approved' | 'published' | 'archived';
export type CampaignPlatform = 'google_ads' | 'meta_ads' | 'linkedin_ads';
export type CampaignObjective =
  | 'traffic'
  | 'lead_generation'
  | 'sales'
  | 'engagement'
  | 'awareness';
export type CampaignStatus =
  | 'draft'
  | 'approval_required'
  | 'approved'
  | 'exported'
  | 'archived';

export interface ContentTheme {
  title: string;
  angle: string;
  keywords: string[];
}

export interface ContentPlanItem {
  title: string;
  channel: string;
  format: 'blog' | 'landing_page' | 'email' | 'social_post' | 'ad_creative' | 'video';
  funnelGoal: FunnelGoal;
  theme: string;
  primaryCta: string;
}

export interface ContentPlanInput {
  brandName: string;
  planningWindow: PlanningWindow;
  funnelGoal: FunnelGoal;
  channels: string[];
  themes: ContentTheme[];
  offer: string;
}

export interface ContentPlan {
  items: ContentPlanItem[];
  channelMix: string[];
  audienceSegments: string[];
}

export interface LandingPageSection {
  key: string;
  heading: string;
  body: string;
}

export interface LandingPageDraftInput {
  brandName: string;
  offer: string;
  audience: string;
  primaryGoal: FunnelGoal;
  differentiators: string[];
  proofPoints: string[];
  targetKeyword: string;
}

export interface LandingPageDraft {
  pageName: string;
  targetUrlSlug: string;
  funnelStage: FunnelGoal;
  hero: {
    headline: string;
    subheadline: string;
  };
  sections: LandingPageSection[];
  seo: {
    title: string;
    description: string;
    keyword: string;
  };
  cta: {
    label: string;
    action: string;
  };
}

export interface CampaignDraftInput {
  platform: CampaignPlatform;
  objective: CampaignObjective;
  budgetAmount: number;
  budgetCurrency: string;
  geoTargets: string[];
  audienceSummary: string;
  offer: string;
  hooks: string[];
}

export interface CampaignDraft {
  platform: CampaignPlatform;
  objective: CampaignObjective;
  budgetAmount: number;
  budgetCurrency: string;
  geoTargets: string[];
  complianceFlags: string[];
  adSets: Array<{
    name: string;
    audience: string;
    hook: string;
    cta: string;
  }>;
}