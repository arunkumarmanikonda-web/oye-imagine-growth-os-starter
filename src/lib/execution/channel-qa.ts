import type {
  ChannelQaInput,
  ChannelQaResult,
} from './execution-governance-types';

function hasRiskyClaim(claims: string[]): boolean {
  return claims.some((claim) => /guarantee|100%|instant|assured/i.test(claim));
}

export function evaluateChannelQa(input: ChannelQaInput): ChannelQaResult {
  const checks: string[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];

  if (input.brandLocked) {
    checks.push('brand lock confirmed');
  } else {
    blockers.push('asset is not brand-locked');
  }

  if (input.approvalStatus === 'approved') {
    checks.push('approval confirmed');
  } else {
    blockers.push('asset is not approved');
  }

  if (input.destinationUrl) {
    checks.push('destination URL present');
  } else if (input.assetType === 'landing_page' || input.assetType === 'campaign_draft') {
    blockers.push('destination URL missing');
  }

  if (input.primaryCta) {
    checks.push('primary CTA present');
  } else {
    warnings.push('primary CTA missing');
  }

  if (hasRiskyClaim(input.claims)) {
    warnings.push('claims require legal or substantiation review');
  }

  return {
    checks,
    warnings,
    blockers,
    passed: blockers.length === 0,
  };
}