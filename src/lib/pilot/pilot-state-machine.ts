import type {
  PilotStateInput,
  PilotStateSummary,
  PilotStage,
} from './pilot-integration-types';

const stageOrder: PilotStage[] = [
  'onboarding',
  'audit',
  'strategy',
  'activation',
  'live',
];

export function buildPilotStateSummary(
  input: PilotStateInput,
): PilotStateSummary {
  const blockers: string[] = [];
  let nextStage = input.currentStage;

  switch (input.currentStage) {
    case 'onboarding':
      if (!input.auditReady) {
        blockers.push('website audit not ready');
      } else {
        nextStage = 'audit';
      }
      break;
    case 'audit':
      if (!input.strategyReady) {
        blockers.push('strategy not ready');
      } else {
        nextStage = 'strategy';
      }
      break;
    case 'strategy':
      if (!input.activationReady) {
        blockers.push('commercial activation not ready');
      } else {
        nextStage = 'activation';
      }
      break;
    case 'activation':
      if (!input.liveSignalsHealthy) {
        blockers.push('live signals not healthy');
      } else {
        nextStage = 'live';
      }
      break;
    case 'live':
      nextStage = 'live';
      break;
  }

  return {
    currentStage: input.currentStage,
    nextStage,
    canAdvance: blockers.length === 0 && nextStage !== input.currentStage,
    blockers,
  };
}

export function stageProgressIndex(stage: PilotStage): number {
  return stageOrder.indexOf(stage);
}