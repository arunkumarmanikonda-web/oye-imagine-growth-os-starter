import type { TenantBrandProfile } from './recovery-types'

export const neejeeCanonicalTenantBrandProfile: TenantBrandProfile = {
  tenantId: 'tenant_neejee',
  workspaceId: 'workspace_neejee_primary',
  brandId: 'brand_neejee',
  brandName: 'Neejee',
  industry: 'Education and growth services',
  offerSummary:
    'Flagship pilot tenant for the recovered Oye !magine operating system, prepared for canonical onboarding, strategy and execution grounding.',
  primaryAudience: 'Students, parents and decision-makers evaluating guided growth and advisory journeys',
  budgetBand: 'Managed pilot budget',
  activeChannels: ['Search', 'Performance landing pages', 'CRM follow-up'],
  successMetrics: ['Qualified leads', 'Application pipeline', 'Conversion quality'],
  verificationStatus: 'canonical_seeded',
}

export function getNeejeeCanonicalProfile(): TenantBrandProfile {
  return neejeeCanonicalTenantBrandProfile
}

export function getNeejeeTruthSignals(): string[] {
  return [
    `Tenant ${neejeeCanonicalTenantBrandProfile.tenantId}`,
    `Workspace ${neejeeCanonicalTenantBrandProfile.workspaceId}`,
    `Brand ${neejeeCanonicalTenantBrandProfile.brandName}`,
    `Industry ${neejeeCanonicalTenantBrandProfile.industry}`,
    `Verification ${neejeeCanonicalTenantBrandProfile.verificationStatus}`,
  ]
}