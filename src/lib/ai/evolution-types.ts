export const EVOLUTION_ACTIVITY_TYPES = [
  'tenant_signed_up',
  'brand_fact_learned',
  'research_completed',
  'strategy_generated',
  'prompt_executed',
  'creative_generated',
  'video_generated',
  'landing_page_generated',
  'keyword_recommended',
  'keyword_activated',
  'campaign_created',
  'campaign_optimized',
  'social_page_created',
  'content_generated',
  'content_published',
  'content_edited',
  'content_approved',
  'content_rejected',
  'experiment_started',
  'experiment_completed',
  'conversion_observed',
  'revenue_observed',
  'user_feedback',
  'system_feedback',
] as const;

export type EvolutionActivityType = (typeof EVOLUTION_ACTIVITY_TYPES)[number];

export type EvolutionReuseScope =
  | 'tenant_private'
  | 'workspace_private'
  | 'platform_anonymized';

export type EvolutionSensitivity =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'personal'
  | 'regulated';

export type EvolutionRiskClass = 'low' | 'medium' | 'high' | 'critical';

export type EvolutionOutcomeMetric = {
  key:
    | 'ctr'
    | 'cvr'
    | 'cpa'
    | 'roas'
    | 'revenue'
    | 'engagement_rate'
    | 'lead_quality'
    | 'approval_rate'
    | 'brand_fit'
    | 'organic_visibility'
    | 'retention'
    | 'user_edit_distance'
    | 'custom';
  value: number;
  unit?: string;
  direction?: 'higher_is_better' | 'lower_is_better';
  observedAt?: string;
};

export type EvolutionEventInput = {
  tenantId: string;
  workspaceId: string;
  brandId?: string | null;
  activityType: EvolutionActivityType;
  sourceEntityType: string;
  sourceEntityId: string;
  productCategory?: string | null;
  vertical?: string | null;
  channel?: string | null;
  language?: 'en' | 'hi' | 'hinglish' | 'other';
  intent?: string | null;
  promptTemplateKey?: string | null;
  promptTemplateVersion?: string | null;
  promptHash?: string | null;
  provider?: string | null;
  model?: string | null;
  inputFingerprint?: string | null;
  outputFingerprint?: string | null;
  metadata?: Record<string, unknown>;
  outcomeMetrics?: EvolutionOutcomeMetric[];
  reuseScope?: EvolutionReuseScope;
  sensitivity?: EvolutionSensitivity;
  containsPersonalData?: boolean;
  containsClientSecrets?: boolean;
  riskClass?: EvolutionRiskClass;
};

export type EvolutionEventRecord = EvolutionEventInput & {
  eventId: string;
  occurredAt: string;
  reuseScope: EvolutionReuseScope;
  sensitivity: EvolutionSensitivity;
  riskClass: EvolutionRiskClass;
  containsPersonalData: boolean;
  containsClientSecrets: boolean;
  metadata: Record<string, unknown>;
  outcomeMetrics: EvolutionOutcomeMetric[];
};

export type LearningPatternCandidate = {
  patternKey: string;
  title: string;
  summary: string;
  vertical?: string | null;
  productCategory?: string | null;
  channel?: string | null;
  language?: string | null;
  evidenceEventIds: string[];
  distinctTenantCount: number;
  sampleCount: number;
  confidence: number;
  outcomeLift: number | null;
  reuseScope: EvolutionReuseScope;
  sensitivity: EvolutionSensitivity;
  riskClass: EvolutionRiskClass;
};

export type LearningPromotionDecision = {
  decision: 'promote' | 'observe' | 'reject';
  destination: 'tenant_memory' | 'platform_pattern_library' | 'none';
  autonomous: boolean;
  reason: string;
};

export type AutonomousActionKind =
  | 'regenerate_copy'
  | 'regenerate_creative'
  | 'adjust_prompt_route'
  | 'adjust_keyword_bid_within_cap'
  | 'pause_underperforming_asset'
  | 'publish_preapproved_content'
  | 'change_budget_cap'
  | 'execute_payment'
  | 'execute_contract'
  | 'change_legal_template'
  | 'change_security_guardrail'
  | 'deploy_code'
  | 'run_schema_migration';

export type AutonomousActionPolicy = {
  action: AutonomousActionKind;
  riskClass: EvolutionRiskClass;
  allowedWithoutHuman: boolean;
  requiresPreapprovedEnvelope: boolean;
  rationale: string;
};
