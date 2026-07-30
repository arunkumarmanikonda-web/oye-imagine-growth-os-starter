export type PilotWorkflowStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready'
  | 'blocked'
  | 'completed';

export type InvoiceLifecycleStatus =
  | 'not_issued'
  | 'issued'
  | 'paid'
  | 'overdue';

export type PortalPhase =
  | 'onboarding'
  | 'strategy'
  | 'contracting'
  | 'activation'
  | 'live';

export type OperatorQueueType =
  | 'onboarding'
  | 'strategy'
  | 'legal'
  | 'billing'
  | 'approval'
  | 'activation'
  | 'support';

export type OperatorPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CommercialContinuityInput {
  brandName: string;
  onboardingCompleted: boolean;
  strategyGenerated: boolean;
  strategyApproved: boolean;
  contractSigned: boolean;
  subscriptionActive: boolean;
  invoiceStatus: InvoiceLifecycleStatus;
  approvalOpenCount: number;
  auditCoverage: number;
  mediaBalanceAmount: number;
  currency: string;
}

export interface CommercialContinuitySummary {
  brandName: string;
  overallStatus: PilotWorkflowStatus;
  readyForActivation: boolean;
  statuses: {
    onboarding: PilotWorkflowStatus;
    strategy: PilotWorkflowStatus;
    contract: PilotWorkflowStatus;
    subscription: PilotWorkflowStatus;
    invoicing: PilotWorkflowStatus;
    approvals: PilotWorkflowStatus;
    audit: PilotWorkflowStatus;
  };
  blockers: string[];
  nextActions: string[];
  clientVisibleLedger: {
    mediaBalanceAmount: number;
    currency: string;
    invoiceStatus: InvoiceLifecycleStatus;
  };
}

export interface ClientPortalSnapshot {
  brandName: string;
  phase: PortalPhase;
  headline: string;
  readinessScore: number;
  workflowStatus: CommercialContinuitySummary['statuses'];
  clientAlerts: string[];
  nextActions: string[];
  financialOverview: {
    mediaBalanceAmount: number;
    currency: string;
    invoiceStatus: InvoiceLifecycleStatus;
  };
}

export interface OperatorWorkItem {
  queueType: OperatorQueueType;
  priority: OperatorPriority;
  title: string;
  ownerRole: string;
  status: 'open';
  payload: Record<string, unknown>;
}

export interface OperatorWorkspaceInput {
  brandName: string;
  summary: CommercialContinuitySummary;
  requestedLaunchDate?: string;
}

export interface StrategyPresentationInput {
  brandName: string;
  websiteUrl: string;
  industry: string;
  positioning: string;
  offerSummary: string;
  auditFindings: string[];
  competitorInsights: string[];
  growthGoals: string[];
}

export interface StrategyPresentationSection {
  key: string;
  title: string;
  bullets: string[];
}

export interface StrategyPresentationManifest {
  deckTitle: string;
  objective: string;
  sections: StrategyPresentationSection[];
  approvalStatus: 'review_required' | 'approved';
}