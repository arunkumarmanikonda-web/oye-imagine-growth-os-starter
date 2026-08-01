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
    nextBestAction = `${input.brandName}: resolve ${input.activeBlockers} active blocker(s)`;
    ownerRole = 'PROGRAM_MANAGER';
  } else if (input.openApprovals > 0) {
    nextBestAction = `${input.brandName}: clear ${input.openApprovals} open approval(s)`;
    ownerRole = 'PROGRAM_MANAGER';
  } else if (input.pendingCampaigns > 0) {
    nextBestAction = `${input.brandName}: prepare ${input.pendingCampaigns} pending campaign draft(s)`;
    ownerRole = 'PERFORMANCE_MARKETER';
  } else if (input.pendingReports > 0) {
    nextBestAction = `${input.brandName}: publish ${input.pendingReports} pending report(s)`;
    ownerRole = 'REPORTING_MANAGER';
  } else if (input.pendingStrategyTasks > 0) {
    nextBestAction = `${input.brandName}: complete ${input.pendingStrategyTasks} remaining strategy task(s)`;
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
