import { describe, expect, it } from 'vitest';
import {
  buildSupportHandoffSummary,
  supportHandoffReady,
} from '../../src/lib/ops/support-handoff';

describe('support-handoff', () => {
  it('marks handoff ready when support package is complete', () => {
    const summary = buildSupportHandoffSummary({
      brandName: 'Neejee',
      runbookReady: true,
      escalationPathReady: true,
      trainingReady: true,
      supportContacts: ['ops@neejee.com'],
    });

    expect(summary.handoffStatus).toBe('ready');
    expect(supportHandoffReady(summary)).toBe(true);
  });

  it('blocks handoff when runbook and contacts are missing', () => {
    const summary = buildSupportHandoffSummary({
      brandName: 'Neejee',
      runbookReady: false,
      escalationPathReady: true,
      trainingReady: true,
      supportContacts: [],
    });

    expect(summary.handoffStatus).toBe('blocked');
    expect(summary.missingElements).toContain('runbook');
    expect(summary.missingElements).toContain('supportContacts');
  });
});