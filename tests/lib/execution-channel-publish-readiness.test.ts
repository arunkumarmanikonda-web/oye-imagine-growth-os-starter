import { describe, expect, it } from 'vitest';
import {
  buildChannelPublishReadinessSummary,
  channelReadyForPublish,
} from '../../src/lib/execution/channel-publish-readiness';

describe('channel-publish-readiness', () => {
  it('marks channel ready when checks pass', () => {
    const summary = buildChannelPublishReadinessSummary({
      brandName: 'Neejee',
      channel: 'google',
      requiredFieldsComplete: true,
      qaChecks: [
        { name: 'policy', passed: true },
        { name: 'tracking', passed: true },
      ],
    });

    expect(summary.qaStatus).toBe('ready');
    expect(channelReadyForPublish(summary)).toBe(true);
  });

  it('blocks channel when a QA check fails', () => {
    const summary = buildChannelPublishReadinessSummary({
      brandName: 'Neejee',
      channel: 'meta',
      requiredFieldsComplete: true,
      qaChecks: [
        { name: 'policy', passed: false },
        { name: 'tracking', passed: true },
      ],
    });

    expect(summary.qaStatus).toBe('blocked');
    expect(summary.blockers).toContain('failed QA: policy');
  });
});