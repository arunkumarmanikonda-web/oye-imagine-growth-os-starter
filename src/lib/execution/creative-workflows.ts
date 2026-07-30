import type { CreativeAssetDraft, CreativeAssetInput, CreativeFormat } from './execution-types';

function aspectRatioFor(format: CreativeFormat): string {
  switch (format) {
    case 'static':
      return '1:1';
    case 'carousel':
      return '4:5';
    case 'reel':
      return '9:16';
    case 'story':
      return '9:16';
    case 'banner':
      return '16:9';
    default:
      return '1:1';
  }
}

function hasRiskyClaim(claims: string[]): boolean {
  return claims.some((claim) => /guarantee|100%|instant|assured/i.test(claim));
}

export function buildCreativeAssetDraft(input: CreativeAssetInput): CreativeAssetDraft {
  const complianceFlags: string[] = [];

  if (input.claims.length > 0 && !input.disclaimer) {
    complianceFlags.push('claim_disclaimer_required');
  }

  if (hasRiskyClaim(input.claims)) {
    complianceFlags.push('claim_substantiation_required');
  }

  const assets = input.hooks.map((hook, index) => {
    const format = input.formats[index % input.formats.length]!;
    return {
      format,
      aspectRatio: aspectRatioFor(format),
      hook,
      headline: `${input.offer} for ${input.audience}`,
      primaryText: `${hook} — built for ${input.audience}.`,
    };
  });

  return {
    platform: input.platform,
    objective: input.objective,
    assets,
    complianceFlags,
    disclaimer: input.disclaimer,
  };
}

export function creativeDraftNeedsLegalReview(draft: CreativeAssetDraft): boolean {
  return draft.complianceFlags.length > 0;
}