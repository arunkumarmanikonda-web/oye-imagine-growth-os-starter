import type {
  ChannelPublishReadinessInput,
  ChannelPublishReadinessSummary,
} from './execution-integration-types';

export function buildChannelPublishReadinessSummary(
  input: ChannelPublishReadinessInput,
): ChannelPublishReadinessSummary {
  const blockers: string[] = [];

  if (!input.requiredFieldsComplete) blockers.push('required fields incomplete');

  const failedChecks = input.qaChecks
    .filter((check) => !check.passed)
    .map((check) => `failed QA: ${check.name}`);

  blockers.push(...failedChecks);

  return {
    qaStatus: blockers.length === 0 ? 'ready' : 'blocked',
    blockers,
    nextAction:
      blockers.length === 0
        ? `${input.brandName}: publish to ${input.channel}`
        : `${input.brandName}: resolve ${input.channel} blockers`,
  };
}

export function channelReadyForPublish(
  summary: ChannelPublishReadinessSummary,
): boolean {
  return summary.qaStatus === 'ready' && summary.blockers.length === 0;
}