export type SpecialistReadinessInput = {
  profileComplete: boolean;
  skillsProvided: boolean;
  portfolioVerified: boolean;
  pricingConfigured: boolean;
  serviceCategoriesSelected: boolean;
  availabilitySet: boolean;
  identityVerified: boolean;
  complianceCleared: boolean;
};

export type SpecialistReadinessSummary = {
  status: 'ready' | 'partial' | 'blocked';
  blockers: string[];
  readyChecks: string[];
};

export function buildSpecialistReadinessSummary(
  input: SpecialistReadinessInput,
): SpecialistReadinessSummary {
  const blockers: string[] = [];
  const readyChecks: string[] = [];

  if (input.profileComplete) readyChecks.push('profile complete');
  else blockers.push('profile incomplete');

  if (input.skillsProvided) readyChecks.push('skills provided');
  else blockers.push('skills missing');

  if (input.portfolioVerified) readyChecks.push('portfolio verified');
  else blockers.push('portfolio not verified');

  if (input.pricingConfigured) readyChecks.push('pricing configured');
  else blockers.push('pricing not configured');

  if (input.serviceCategoriesSelected) readyChecks.push('service categories selected');
  else blockers.push('service categories missing');

  if (input.availabilitySet) readyChecks.push('availability set');
  else blockers.push('availability not set');

  if (input.identityVerified) readyChecks.push('identity verified');
  else blockers.push('identity not verified');

  if (input.complianceCleared) readyChecks.push('compliance cleared');
  else blockers.push('compliance not cleared');

  let status: 'ready' | 'partial' | 'blocked' = 'blocked';
  if (blockers.length === 0) {
    status = 'ready';
  } else if (readyChecks.length > 0) {
    status = 'partial';
  }

  return {
    status,
    blockers,
    readyChecks,
  };
}

export function specialistReady(summary: SpecialistReadinessSummary): boolean {
  return summary.status === 'ready' && summary.blockers.length === 0;
}

export function marketplaceEntryAllowed(summary: SpecialistReadinessSummary): boolean {
  return specialistReady(summary);
}