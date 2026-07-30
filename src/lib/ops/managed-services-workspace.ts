import type {
  ManagedServicesWorkspaceInput,
  ManagedServicesWorkspaceSnapshot,
} from './ops-closeout-types';

export function buildManagedServicesWorkspaceSnapshot(
  input: ManagedServicesWorkspaceInput,
): ManagedServicesWorkspaceSnapshot {
  let nextBestAction = `${input.brandName}: continue managed services execution`;
  let ownerRole = 'ACCOUNT_MANAGER';

  if (input.activeBlockers > 0) {
    nextBestAction = `${input.brandName}: resolve active blockers first`;
    ownerRole = 'PROGRAM_MANAGER';
  } else if (input.openApprovals > 0) {
    nextBestAction = `${input.brandName}: clear open approvals`;
    ownerRole = 'PROGRAM_MANAGER';
  } else if (input.pendingCampaigns > 0) {
    nextBestAction = `${input.brandName}: prepare next campaign draft package`;
    ownerRole = 'PERFORMANCE_MARKETER';
  } else if (input.pendingReports > 0) {
    nextBestAction = `${input.brandName}: publish pending reports`;
    ownerRole = 'REPORTING_MANAGER';
  } else if (input.pendingStrategyTasks > 0) {
    nextBestAction = `${input.brandName}: complete remaining strategy tasks`;
    ownerRole = 'STRATEGY_LEAD';
  }

  return {
    queueSummary: {
      openApprovals: input.openApprovals,
      pendingReports: input.pendingReports,
      pendingCampaigns: input.pendingCampaigns,
      pendingStrategyTasks: input.pendingStrategyTasks,
      activeBlockers: input.activeBlockers,
    },
    nextBestAction,
    ownerRole,
  };
}

export function managedWorkspaceHasActionableQueue(
  snapshot: ManagedServicesWorkspaceSnapshot,
): boolean {
  const summary = snapshot.queueSummary;
  return (
    summary.openApprovals +
    summary.pendingReports +
    summary.pendingCampaigns +
    summary.pendingStrategyTasks +
    summary.activeBlockers
  ) > 0;
}