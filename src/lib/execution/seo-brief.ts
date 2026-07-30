import type { SeoBrief, SeoBriefInput } from './execution-types';

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildSeoBrief(input: SeoBriefInput): SeoBrief {
  const supportingKeywords = unique(input.supportingKeywords);
  const headingOutline = [
    `${input.offer} for ${input.audience}`,
    `Why ${input.primaryKeyword} matters now`,
    `How ${input.brandName} differentiates`,
    `What to expect before conversion`,
  ];

  return {
    briefName: `${input.brandName} ${slug(input.primaryKeyword)}`,
    primaryKeyword: input.primaryKeyword,
    supportingKeywords,
    titleOptions: unique([
      `${input.primaryKeyword} | ${input.brandName}`,
      `${input.offer} for ${input.audience} | ${input.brandName}`,
      `${input.brandName}: ${input.primaryKeyword}`,
    ]),
    metaDescription: `${input.brandName} helps ${input.audience} achieve ${input.offer} with a conversion-focused experience built around ${input.primaryKeyword}.`,
    headingOutline,
    internalLinks: ['/collections', '/consultations', '/about-us'],
    schemaRecommendations: ['Organization', 'BreadcrumbList', 'FAQPage'],
  };
}

export function seoBriefReadyForReview(brief: SeoBrief): boolean {
  return Boolean(
    brief.primaryKeyword &&
    brief.titleOptions.length >= 3 &&
    brief.headingOutline.length >= 4 &&
    brief.metaDescription.length >= 100,
  );
}