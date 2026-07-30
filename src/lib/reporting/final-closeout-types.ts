export type ReportDeliveryCenterInput = {
  brandName: string;
  recipients: string[];
  reportArtifacts: string[];
  approvalsComplete: boolean;
  scheduleConfigured: boolean;
};

export type ReportDeliveryCenterSummary = {
  deliveryStatus: 'ready' | 'blocked';
  recipientCount: number;
  artifactCount: number;
  blockers: string[];
};

export type LaunchReadinessDashboardInput = {
  brandName: string;
  validationPassed: boolean;
  securityReviewPassed: boolean;
  performanceReviewPassed: boolean;
  monitoringReady: boolean;
  supportReady: boolean;
  openCriticalDependencies: string[];
};

export type LaunchReadinessDashboardSummary = {
  overallStatus: 'ready' | 'blocked';
  blockerCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  nextAction: string;
};