import { describe, expect, it } from 'vitest';
import {
  buildPilotStateSummary,
  stageProgressIndex,
} from '../../src/lib/pilot/pilot-state-machine';

describe('pilot-state-machine', () => {
  it('advances onboarding into audit when audit is ready', () => {
    const summary = buildPilotStateSummary({
      currentStage: 'onboarding',
      auditReady: true,
      strategyReady: false,
      activationReady: false,
      liveSignalsHealthy: false,
    });

    expect(summary.nextStage).toBe('audit');
    expect(summary.canAdvance).toBe(true);
  });

  it('holds strategy when activation is not ready', () => {
    const summary = buildPilotStateSummary({
      currentStage: 'strategy',
      auditReady: true,
      strategyReady: true,
      activationReady: false,
      liveSignalsHealthy: false,
    });

    expect(summary.nextStage).toBe('strategy');
    expect(summary.canAdvance).toBe(false);
    expect(summary.blockers).toContain('commercial activation not ready');
    expect(stageProgressIndex('activation')).toBeGreaterThan(stageProgressIndex('strategy'));
  });
});