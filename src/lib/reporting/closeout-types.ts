import type {
  AnalyticsKpiSummary,
  OptimizationRecommendation,
  ReportAudience,
} from './reporting-types';

export type DashboardPersona =
  | 'client'
  | 'internal'
  | 'exec'
  | 'operator'
  | 'super_admin';

export interface PersonaDashboardInput {
  brandName: string;
  persona: DashboardPersona;
  summary: AnalyticsKpiSummary;
  recommendationCount: number;
  blockerCount: number;
  openApprovalCount: number;
  activeIncidentCount: number;
}

export interface PersonaDashboardSnapshot {
  title: string;
  persona: DashboardPersona;
  cards: Array<{
    label: string;
    value: string;
    tone: 'neutral' | 'positive' | 'warning' | 'critical';
  }>;
  highlights: string[];
}

export interface ReportPublicationInput {
  reportName: string;
  audience: ReportAudience;
  formats: Array<'web' | 'pdf' | 'pptx' | 'xlsx'>;
  approvalStatus: 'draft' | 'approved';
  includesFinancialData: boolean;
}

export interface ReportPublicationPlan {
  jobs: Array<{
    format: 'web' | 'pdf' | 'pptx' | 'xlsx';
    targetAudience: ReportAudience;
    decision: 'ready' | 'approval_required' | 'blocked';
    requiresApproval: boolean;
  }>;
  blockedReasons: string[];
  ready: boolean;
}

export interface OptimizationEscalationInput {
  channel: string;
  recommendations: OptimizationRecommendation[];
  activeIncidents: number;
  spendAtRisk: number;
}

export interface OptimizationEscalation {
  severity: 'low' | 'medium' | 'high' | 'critical';
  ownerRole: string;
  escalationReason: string;
  dueHours: number;
}

export type LeadershipDashboardPersona =
  | 'founder'
  | 'ceo'
  | 'cmo'
  | 'performance'
  | 'seo'
  | 'social'
  | 'finance'
  | 'account_manager'
  | 'marketplace';

export interface DashboardTruthSummary {
  personaCount: number;
  hasExecutiveCoverage: boolean;
  hasOperatorCoverage: boolean;
  attributionVisible: boolean;
}
