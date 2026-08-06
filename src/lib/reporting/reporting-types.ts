export type AnalyticsSource = 'ga4' | 'google_ads' | 'meta_ads' | 'crm' | 'blended';
export type ReportAudience = 'client' | 'internal' | 'exec';
export type RecommendationPriority = 'low' | 'medium' | 'high';

export interface AnalyticsKpiInput {
  periodLabel: string;
  spend: number;
  revenue: number;
  leads: number;
  visitors: number;
  conversions: number;
  orders: number;
}

export interface AnalyticsKpiSummary {
  periodLabel: string;
  spend: number;
  revenue: number;
  leads: number;
  visitors: number;
  conversions: number;
  orders: number;
  roas: number;
  cpl: number;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerVisitor: number;
  leadToCustomerRate: number;
}

export interface KpiDeltaReport {
  roasDelta: number;
  cplDelta: number;
  conversionRateDelta: number;
  revenueDelta: number;
  leadDelta: number;
}

export interface ReportSnapshotInput {
  brandName: string;
  periodLabel: string;
  audience: ReportAudience;
  summary: AnalyticsKpiSummary;
  topInsights: string[];
  risks: string[];
  recommendedActions: string[];
}

export interface ReportSnapshot {
  reportName: string;
  audience: ReportAudience;
  summaryCards: Array<{
    label: string;
    value: string;
  }>;
  narrative: string;
  topInsights: string[];
  risks: string[];
  recommendedActions: string[];
}

export interface OptimizationContext {
  channel: string;
  summary: AnalyticsKpiSummary;
  targetRoas: number;
  targetConversionRate: number;
  maxCpl: number;
}

export interface OptimizationRecommendation {
  channel: string;
  priority: RecommendationPriority;
  recommendationType: string;
  rationale: string;
  expectedImpact: string;
}

export type UnifiedDataSource =
  | AnalyticsSource
  | 'site_app'
  | 'social'
  | 'email'
  | 'payments'
  | 'marketplace'
  | 'finance'
  | 'uploads'
  | 'manual';

export interface UnifiedMetricDefinition {
  metricKey: string;
  displayName: string;
  owner: string;
  sources: UnifiedDataSource[];
  formula: string;
  refreshedBy: string;
}

export interface KpiGovernanceSummary {
  version: string;
  metricCount: number;
  ownerCount: number;
  sourceCount: number;
  ready: boolean;
}
