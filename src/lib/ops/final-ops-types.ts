export type SupportHandoffInput = {
  brandName: string;
  runbookReady: boolean;
  escalationPathReady: boolean;
  trainingReady: boolean;
  supportContacts: string[];
};

export type SupportHandoffSummary = {
  handoffStatus: 'ready' | 'blocked';
  missingElements: string[];
};

export type DependencySignoffInput = {
  brandName: string;
  dependencies: Array<{
    name: string;
    required: boolean;
    status: 'ready' | 'pending' | 'blocked';
  }>;
};

export type DependencySignoffSummary = {
  clearToLaunch: boolean;
  unresolvedDependencies: string[];
  blockingDependencies: string[];
};

export type HardeningEvidenceInput = {
  brandName: string;
  validationReport: boolean;
  securityReport: boolean;
  performanceReport: boolean;
  launchChecklist: boolean;
  rollbackPlan: boolean;
};

export type HardeningEvidenceSummary = {
  evidenceStatus: 'ready' | 'incomplete';
  missingEvidence: string[];
};