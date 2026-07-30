import type {
  LandingPagePublicationInput,
  LandingPagePublicationSummary,
} from './execution-integration-types';

export function buildLandingPagePublicationSummary(
  input: LandingPagePublicationInput,
): LandingPagePublicationSummary {
  const blockers: string[] = [];

  if (!input.qaPassed) blockers.push('QA not passed');
  if (input.approvalRequired && !input.approvalGranted) blockers.push('approval not granted');
  if (input.assetBundle.length === 0) blockers.push('asset bundle missing');

  return {
    publicationStatus: blockers.length === 0 ? 'ready' : 'blocked',
    blockers,
    assetCount: input.assetBundle.length,
  };
}

export function landingPageCanPublish(
  summary: LandingPagePublicationSummary,
): boolean {
  return summary.publicationStatus === 'ready' && summary.blockers.length === 0;
}