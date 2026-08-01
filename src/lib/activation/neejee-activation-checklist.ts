import type {
  NeejeeActivationChecklistInput,
  NeejeeActivationChecklistSummary,
} from './activation-types';

export function buildNeejeeActivationChecklistSummary(
  input: NeejeeActivationChecklistInput,
): NeejeeActivationChecklistSummary {
  const completedItems: string[] = [];
  const missingItems: string[] = [];

  const checks: Array<[string, boolean]> = [
    ['websiteConnected', input.websiteConnected],
    ['analyticsConnected', input.analyticsConnected],
    ['adsConnected', input.adsConnected],
    ['searchConsoleConnected', input.searchConsoleConnected],
    ['approvalsConfigured', input.approvalsConfigured],
    ['billingConfigured', input.billingConfigured],
    ['strategyApproved', input.strategyApproved],
  ];

  for (const [name, passed] of checks) {
    if (passed) completedItems.push(name);
    else missingItems.push(name);
  }

  return {
    ready: missingItems.length === 0,
    completedItems,
    missingItems,
  };
}

export function neejeeActivationChecklistReady(
  summary: NeejeeActivationChecklistSummary,
): boolean {
  return summary.ready && summary.missingItems.length === 0;
}