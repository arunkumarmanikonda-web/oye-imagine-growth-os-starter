import type { BrandProfile } from './onboarding-types';

const READINESS_FIELDS: Array<keyof BrandProfile> = [
  'brandPurpose',
  'brandStory',
  'valueProposition',
  'toneOfVoice',
];

export function listMissingBrandProfileFields(profile: BrandProfile): string[] {
  const missing = READINESS_FIELDS.filter((field) => {
    const value = profile[field];
    return typeof value !== 'string' || value.trim().length === 0;
  }).map((field) => field.toString());

  if (!profile.approvedTerms.length) missing.push('approvedTerms');
  if (!profile.audiencePersonas.length) missing.push('audiencePersonas');
  if (!profile.productCategories.length) missing.push('productCategories');

  return missing;
}

export function computeBrandReadiness(profile: BrandProfile): number {
  const missing = listMissingBrandProfileFields(profile);
  const totalChecks = 7;
  const completed = totalChecks - Math.min(totalChecks, missing.length);
  return Math.max(0, Math.min(100, Math.round((completed / totalChecks) * 100)));
}

export function mergeBrandSignals(
  base: BrandProfile,
  incoming: Partial<BrandProfile>,
): BrandProfile {
  const merged: BrandProfile = {
    ...base,
    ...incoming,
    approvedTerms: incoming.approvedTerms ?? base.approvedTerms,
    prohibitedTerms: incoming.prohibitedTerms ?? base.prohibitedTerms,
    audiencePersonas: incoming.audiencePersonas ?? base.audiencePersonas,
    productCategories: incoming.productCategories ?? base.productCategories,
    geographyNotes: incoming.geographyNotes ?? base.geographyNotes,
    complianceNotes: incoming.complianceNotes ?? base.complianceNotes,
    visualGuidelines: incoming.visualGuidelines ?? base.visualGuidelines,
    sourcePayload: incoming.sourcePayload ?? base.sourcePayload,
  };

  merged.readinessScore = computeBrandReadiness(merged);
  return merged;
}

export function brandProfileIsReady(profile: BrandProfile): boolean {
  return (
    listMissingBrandProfileFields(profile).length === 0 &&
    computeBrandReadiness(profile) === 100
  )
}
