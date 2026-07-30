import type { HealthSummary, LaunchReadinessSummary, UsageAssessment } from '../ops';

export type ReleaseDecision = 'go' | 'hold';

export interface ReleaseGateInput {
  environment: 'staging' | 'production';
  health: HealthSummary;
  launch: LaunchReadinessSummary;
  usage: UsageAssessment[];
  validationSuitesPassed: number;
  validationSuitesFailed: number;
}

export interface ReleaseGateSummary {
  decision: ReleaseDecision;
  ready: boolean;
  blockers: string[];
  warnings: string[];
  score: number;
}