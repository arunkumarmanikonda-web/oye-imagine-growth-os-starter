export interface SuperAdminSnapshotInput {
  environment: 'local' | 'staging' | 'production';
  openIncidents: number;
  degradedComponents: number;
  pendingLaunchChecks: number;
  tenantsNearQuota: number;
  failedPublicationJobs: number;
}

export interface SuperAdminSnapshot {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  alerts: string[];
  actionItems: string[];
}

export interface ManagedServicesWorkspaceInput {
  brandName: string;
  openApprovals: number;
  pendingReports: number;
  pendingCampaigns: number;
  pendingStrategyTasks: number;
  activeBlockers: number;
}

export interface ManagedServicesWorkspaceSnapshot {
  queueSummary: {
    openApprovals: number;
    pendingReports: number;
    pendingCampaigns: number;
    pendingStrategyTasks: number;
    activeBlockers: number;
  };
  nextBestAction: string;
  ownerRole: string;
}