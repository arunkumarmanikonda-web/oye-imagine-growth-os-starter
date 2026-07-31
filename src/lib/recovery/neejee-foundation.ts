import { organizationProfile, supportChannels } from './organization-profile'

export const canonicalNeejeeProfile = {
  tenantId: 'tenant_neejee',
  workspaceId: 'workspace_neejee_primary',
  brandId: 'brand_neejee',
  brandName: 'Neejee',
  domain: 'neejee.com',
  industry: 'Premium Indian craft-led e-commerce',
  positioning: 'Founder-led, craft-rooted, premium and emotionally personal commerce brand.',
  audience: [
    'Gift buyers seeking personal and culturally rooted premium products',
    'Design-conscious buyers looking for quiet luxury and authentic craftsmanship',
  ],
  offer: [
    'Craft-led gifting and premium personal products',
    'Story-rich, trust-led digital commerce experience',
  ],
  channels: ['Website', 'SEO', 'Paid media', 'Organic social', 'Reporting'],
  goals: [
    'Strengthen premium category discoverability',
    'Improve conversion clarity and campaign readiness',
    'Create a trustworthy operating baseline for growth execution',
  ],
  successMetrics: ['Qualified demand', 'Conversion rate', 'Revenue quality', 'Repeat customer confidence'],
  canonicalTruthSource: 'mega_batch_a_neejee_foundation',
} as const

export function getCanonicalNeejeeProfile() {
  return canonicalNeejeeProfile
}

export function buildNeejeeTruthSnapshot() {
  return {
    workspaceId: canonicalNeejeeProfile.workspaceId,
    brandName: canonicalNeejeeProfile.brandName,
    domain: canonicalNeejeeProfile.domain,
    industry: canonicalNeejeeProfile.industry,
    canonicalTruthSource: canonicalNeejeeProfile.canonicalTruthSource,
    legalIssuerName: organizationProfile.legalName,
    gstin: organizationProfile.gstin,
    supportEmail: supportChannels.find((channel) => channel.channel === 'email')?.value ?? '',
    supportPhone: supportChannels.find((channel) => channel.channel === 'phone')?.value ?? '',
    hasBlankCriticalFields: false,
    deprecatedSources: ['pilot-fixtures', 'pilot-store-memory', 'neejee-live-overlay'],
  }
}