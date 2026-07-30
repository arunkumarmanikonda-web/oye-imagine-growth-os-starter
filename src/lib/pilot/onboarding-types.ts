export type OnboardingStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'activated';

export type ServiceKey =
  | 'brand_strategy'
  | 'website_management'
  | 'landing_pages'
  | 'seo'
  | 'aeo_geo'
  | 'google_ads'
  | 'meta_ads'
  | 'linkedin_ads'
  | 'youtube'
  | 'organic_social'
  | 'creative_production'
  | 'video_production'
  | 'email_marketing'
  | 'analytics_reporting'
  | 'cro'
  | 'marketplace'
  | 'managed_services'
  | 'whatsapp'
  | 'sms';

export interface OnboardingIntakeDraft {
  intakeId: string;
  tenantId: string;
  companyName: string;
  legalName?: string | null;
  websiteUrl?: string | null;
  industry?: string | null;
  countriesServed: string[];
  servicesRequested: ServiceKey[];
  autonomyLevel: 0 | 1 | 2 | 3 | 4;
  billingCurrency: string;
  status: OnboardingStatus;
  intakePayload: Record<string, unknown>;
  completionPercent: number;
}

export interface OnboardingProgressSummary {
  completionPercent: number;
  missingFields: string[];
  readyForReview: boolean;
}

export type BrandProfileStatus = 'draft' | 'review' | 'approved' | 'archived';

export interface BrandProfile {
  profileId: string;
  tenantId: string;
  brandId: string;
  workspaceId?: string | null;
  brandPurpose?: string | null;
  brandStory?: string | null;
  valueProposition?: string | null;
  toneOfVoice?: string | null;
  approvedTerms: string[];
  prohibitedTerms: string[];
  audiencePersonas: string[];
  productCategories: string[];
  geographyNotes: string[];
  complianceNotes: string[];
  visualGuidelines: Record<string, unknown>;
  profileStatus: BrandProfileStatus;
  readinessScore: number;
  sourcePayload: Record<string, unknown>;
}

export type StrategyArtifactType =
  | 'strategy_deck'
  | 'audit_report'
  | 'content_plan'
  | 'media_plan'
  | 'executive_summary';

export type StrategyArtifactStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export interface StrategyArtifact {
  artifactId: string;
  tenantId: string;
  brandId: string;
  workspaceId?: string | null;
  intakeId?: string | null;
  artifactType: StrategyArtifactType;
  title: string;
  status: StrategyArtifactStatus;
  version: number;
  summary: Record<string, unknown>;
  sections: Array<Record<string, unknown>>;
  generatedBy?: string | null;
  approvedBy?: string | null;
}