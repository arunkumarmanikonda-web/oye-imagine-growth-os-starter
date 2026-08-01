import { describe, expect, it } from 'vitest';
import {
  buildManagedServicesWorkspaceSnapshot,
  managedWorkspaceHasActionableQueue,
} from '../../src/lib/ops/managed-services-workspace';

describe('ops managed services workspace', () => {
  it('prioritizes blockers first', () => {
    const snapshot = buildManagedServicesWorkspaceSnapshot({
      brandName: 'Neejee',
      openApprovals: 1,
      pendingReports: 1,
      pendingCampaigns: 2,
      pendingStrategyTasks: 1,
      activeBlockers: 3,
    });

    expect(snapshot.ownerRole).toBe('PROGRAM_MANAGER');
    expect(snapshot.nextBestAction).toBe('Neejee: resolve 3 active blocker(s)');
    expect(managedWorkspaceHasActionableQueue(snapshot)).toBe(true);
  });

  it('prioritizes approvals when blockers are clear', () => {
    const snapshot = buildManagedServicesWorkspaceSnapshot({
      brandName: 'Neejee',
      openApprovals: 2,
      pendingReports: 1,
      pendingCampaigns: 1,
      pendingStrategyTasks: 1,
      activeBlockers: 0,
    });

    expect(snapshot.ownerRole).toBe('PROGRAM_MANAGER');
    expect(snapshot.nextBestAction).toBe('Neejee: clear 2 open approval(s)');
  });

  it('handles empty queues gracefully', () => {
    const snapshot = buildManagedServicesWorkspaceSnapshot({
      brandName: 'Neejee',
      openApprovals: 0,
      pendingReports: 0,
      pendingCampaigns: 0,
      pendingStrategyTasks: 0,
      activeBlockers: 0,
    });

    expect(snapshot.nextBestAction).toBe('Neejee: continue managed services execution');
    expect(managedWorkspaceHasActionableQueue(snapshot)).toBe(false);
  });
});
