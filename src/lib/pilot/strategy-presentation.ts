import type {
  StrategyPresentationInput,
  StrategyPresentationManifest,
  StrategyPresentationSection,
} from './pilot-operating-types';

function section(
  key: string,
  title: string,
  bullets: string[],
): StrategyPresentationSection {
  return {
    key,
    title,
    bullets: bullets.filter(Boolean),
  };
}

export function buildStrategyPresentationManifest(
  input: StrategyPresentationInput,
): StrategyPresentationManifest {
  const sections = [
    section('context', 'Executive Context', [
      `${input.brandName} operates in ${input.industry}`,
      `Website: ${input.websiteUrl}`,
      input.positioning,
    ]),
    section('offer', 'Offer and Positioning', [
      input.offerSummary,
      input.positioning,
    ]),
    section('audit', 'Audit Findings', input.auditFindings),
    section('competition', 'Competitor Intelligence', input.competitorInsights),
    section('goals', 'Growth Goals', input.growthGoals),
    section('activation', 'Commercial Activation Path', [
      'Approve strategy',
      'Complete signature and subscription activation',
      'Issue and settle invoice',
      'Move into governed pilot execution',
    ]),
  ];

  return {
    deckTitle: `${input.brandName} pilot strategy`,
    objective: `Move ${input.brandName} from audit to approved pilot activation`,
    sections,
    approvalStatus: 'review_required',
  };
}

export function strategyPresentationReadyForReview(
  manifest: StrategyPresentationManifest,
): boolean {
  return Boolean(
    manifest.deckTitle &&
    manifest.objective &&
    manifest.sections.length >= 6 &&
    manifest.sections.every((section) => section.bullets.length > 0),
  );
}

export function strategyPresentationReadyForExport(
  manifest: StrategyPresentationManifest,
): boolean {
  return (
    strategyPresentationReadyForReview(manifest) &&
    manifest.sections.some((section) => section.key === 'goals') &&
    manifest.sections.some((section) => section.key === 'activation')
  )
}

export function strategyPresentationSectionKeys(
  manifest: StrategyPresentationManifest,
): string[] {
  return manifest.sections.map((section) => section.key)
}
