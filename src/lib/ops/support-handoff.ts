import type {
  SupportHandoffInput,
  SupportHandoffSummary,
} from './final-ops-types';

export function buildSupportHandoffSummary(
  input: SupportHandoffInput,
): SupportHandoffSummary {
  const missingElements: string[] = [];

  if (!input.runbookReady) missingElements.push('runbook');
  if (!input.escalationPathReady) missingElements.push('escalationPath');
  if (!input.trainingReady) missingElements.push('training');
  if (input.supportContacts.length === 0) missingElements.push('supportContacts');

  return {
    handoffStatus: missingElements.length === 0 ? 'ready' : 'blocked',
    missingElements,
  };
}

export function supportHandoffReady(
  summary: SupportHandoffSummary,
): boolean {
  return summary.handoffStatus === 'ready' && summary.missingElements.length === 0;
}