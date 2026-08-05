import type { LandingPageDraft, LandingPageDraftInput, LandingPageSection } from './execution-types';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildLandingPageDraft(input: LandingPageDraftInput): LandingPageDraft {
  const pageName = `${input.brandName} ${input.offer}`.trim();
  const targetUrlSlug = slugify(`${input.brandName}-${input.offer}`);
  const differentiatorText = input.differentiators.join(', ');

  const sections: LandingPageSection[] = [
    {
      key: 'problem',
      heading: `Why ${input.audience} needs this now`,
      body: `${input.brandName} helps ${input.audience} solve the conversion bottlenecks blocking ${input.offer}.`,
    },
    {
      key: 'differentiators',
      heading: 'What makes this offer different',
      body: differentiatorText || 'Differentiators to be confirmed.',
    },
    {
      key: 'proof',
      heading: 'Proof and trust signals',
      body: input.proofPoints.join('; ') || 'Proof points pending approval.',
    },
  ];

  return {
    pageName,
    targetUrlSlug,
    funnelStage: input.primaryGoal,
    hero: {
      headline: `${input.offer} for ${input.audience}`,
      subheadline: `${input.brandName} turns strategy into measurable growth with a clear conversion path.`,
    },
    sections,
    seo: {
      title: `${input.offer} | ${input.brandName}`,
      description: `${input.brandName} helps ${input.audience} achieve ${input.offer} with a conversion-focused experience.`,
      keyword: input.targetKeyword,
    },
    cta: {
      label: 'Book a strategy call',
      action: 'open_contact_form',
    },
  };
}

export function landingPageReadyForApproval(draft: LandingPageDraft): boolean {
  return Boolean(
    draft.hero.headline &&
    draft.hero.subheadline &&
    draft.sections.length >= 3 &&
    draft.seo.title &&
    draft.seo.description &&
    draft.cta.label,
  );
}

export function landingPageHasProofAndCtaCoverage(draft: LandingPageDraft): boolean {
  const hasProof = draft.sections.some((section) => section.key === 'proof' && Boolean(section.body?.trim()));
  const hasDifferentiators = draft.sections.some(
    (section) => section.key === 'differentiators' && Boolean(section.body?.trim()),
  );

  return Boolean(hasProof && hasDifferentiators && draft.cta?.label && draft.cta?.action);
}
