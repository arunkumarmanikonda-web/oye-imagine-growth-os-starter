export type HealthStatus = 'healthy' | 'degraded' | 'down';
export type HealthSeverity = 'info' | 'warning' | 'critical';
export type ReadinessStatus = 'pending' | 'pass' | 'fail' | 'waived';
export type EnforcementAction = 'none' | 'notify' | 'soft_cap' | 'hard_cap';

export interface HealthCheck {
  component: string;
  environment: 'local' | 'staging' | 'production';
  status: HealthStatus;
  severity: HealthSeverity;
  message: string;
  detectedAt: string;
}

export interface HealthSummary {
  overallStatus: HealthStatus;
  incidentCount: number;
  criticalCount: number;
  warningCount: number;
  affectedComponents: string[];
}

export interface UsageSnapshotInput {
  tenantId: string;
  snapshotPeriod: string;
  aiTokensUsed: number;
  aiCostAmount: number;
  contentItemsGenerated: number;
  campaignsExported: number;
  reportsGenerated: number;
  quotaLimit: {
    aiCostAmount: number;
    contentItemsGenerated: number;
    campaignsExported: number;
    reportsGenerated: number;
  };
}

export interface UsageAssessment {
  overageFlags: string[];
  enforcementAction: EnforcementAction;
  utilization: {
    aiCostRatio: number;
    contentRatio: number;
    campaignRatio: number;
    reportRatio: number;
  };
}

export interface LaunchReadinessCheck {
  category: string;
  checkName: string;
  status: ReadinessStatus;
  owner?: string;
  notes?: string;
}

export interface LaunchReadinessSummary {
  ready: boolean;
  passCount: number;
  failCount: number;
  pendingCount: number;
  waivedCount: number;
  blockingChecks: string[];
}