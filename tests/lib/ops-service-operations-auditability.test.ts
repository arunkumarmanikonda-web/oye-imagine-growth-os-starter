import { describe, expect, it } from 'vitest';
import {
  buildServiceOperationsAuditSummary,
  serviceOperationsNeedAttention,
} from '../../src/lib/ops/service-operations-auditability';

describe('ops service operations and communication auditability', () => {
  it('marks service operations ready when slas are healthy and audit trail is complete', () => {
    const summary = buildServiceOperationsAuditSummary({
      brandName: 'Neejee',
      responseSlaMinutes: 30,
      responseActualMinutes: 12,
      resolutionSlaHours: 24,
      resolutionActualHours: 8,
      deliveryDueAt: '2026-08-31T18:00:00Z',
      deliveryCompletedAt: '2026-08-30T10:00:00Z',
      escalationOpenCount: 0,
      blockerCount: 0,
      clientDependencyOpenCount: 0,
      internalDependencyOpenCount: 0,
      communicationLog: {
        secureMessages: 4,
        approvalRequests: 1,
        comments: 3,
        notifications: 2,
        decisions: 1,
        escalations: 0,
        historyEntries: 9,
      },
    });

    expect(summary.responseSlaStatus).toBe('met');
    expect(summary.resolutionSlaStatus).toBe('met');
    expect(summary.deliverySlaStatus).toBe('met');
    expect(summary.operationallyReady).toBe(true);
    expect(summary.auditReady).toBe(true);
    expect(summary.nextBestAction).toBe('Neejee: continue service operations execution');
    expect(summary.ownerRole).toBe('ACCOUNT_MANAGER');
    expect(serviceOperationsNeedAttention(summary)).toBe(false);
  });

  it('prioritizes blockers and dependencies before other work', () => {
    const summary = buildServiceOperationsAuditSummary({
      brandName: 'Neejee',
      responseSlaMinutes: 30,
      responseActualMinutes: 45,
      resolutionSlaHours: 24,
      resolutionActualHours: 36,
      deliveryDueAt: '2026-08-31T18:00:00Z',
      deliveryCompletedAt: '2026-09-01T09:00:00Z',
      escalationOpenCount: 1,
      blockerCount: 2,
      clientDependencyOpenCount: 1,
      internalDependencyOpenCount: 1,
      communicationLog: {
        secureMessages: 2,
        approvalRequests: 1,
        comments: 2,
        notifications: 1,
        decisions: 1,
        escalations: 1,
        historyEntries: 6,
      },
    });

    expect(summary.operationallyReady).toBe(false);
    expect(summary.nextBestAction).toBe('Neejee: resolve 5 service ops blocker(s)');
    expect(summary.ownerRole).toBe('PROGRAM_MANAGER');
    expect(summary.missingCapabilities).toContain('responseSla');
    expect(summary.missingCapabilities).toContain('resolutionSla');
    expect(summary.missingCapabilities).toContain('deliverySla');
    expect(summary.missingCapabilities).toContain('blockerVisibility');
    expect(summary.missingCapabilities).toContain('clientDependencyTracking');
    expect(summary.missingCapabilities).toContain('internalDependencyTracking');
  });

  it('flags missing communication audit coverage when logs are incomplete', () => {
    const summary = buildServiceOperationsAuditSummary({
      brandName: 'Neejee',
      responseSlaMinutes: 30,
      responseActualMinutes: 10,
      resolutionSlaHours: 24,
      resolutionActualHours: 6,
      deliveryDueAt: '2026-08-31T18:00:00Z',
      deliveryCompletedAt: '2026-08-31T12:00:00Z',
      escalationOpenCount: 0,
      blockerCount: 0,
      clientDependencyOpenCount: 0,
      internalDependencyOpenCount: 0,
      communicationLog: {
        secureMessages: 1,
        approvalRequests: 1,
        comments: 1,
        notifications: 0,
        decisions: 0,
        escalations: 0,
        historyEntries: 0,
      },
    });

    expect(summary.operationallyReady).toBe(true);
    expect(summary.auditReady).toBe(false);
    expect(summary.nextBestAction).toBe('Neejee: complete communication audit trail');
    expect(summary.ownerRole).toBe('PROGRAM_MANAGER');
    expect(summary.missingCapabilities).toContain('notifications');
    expect(summary.missingCapabilities).toContain('decisions');
    expect(summary.missingCapabilities).toContain('historyEntries');
    expect(serviceOperationsNeedAttention(summary)).toBe(true);
  });
});