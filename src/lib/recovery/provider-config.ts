import type {
  ProviderConfigProfile,
  ProviderConfigSummary,
} from './recovery-types'
import { getLegalIdentitySummary, getOrganizationProfile, getSupportChannels } from './company-profile'
import { getNeejeeCanonicalProfile } from './neejee-canonical'

export const providerConfigProfiles: ProviderConfigProfile[] = [
  {
    id: 'provider_supabase_runtime',
    kind: 'supabase',
    label: 'Supabase runtime',
    status: 'connected',
    maskedValue: 'sb_project: configured',
    scope: 'global',
    lastValidatedAt: '2026-07-30T08:00:00.000Z',
    syncState: 'ready',
    secretBacked: true,
  },
  {
    id: 'provider_resend_primary',
    kind: 'resend',
    label: 'Resend support mail',
    status: 'seeded',
    maskedValue: 'hello@oyeimagine.com',
    scope: 'global',
    syncState: 'pending',
    secretBacked: true,
  },
  {
    id: 'provider_legal_identity',
    kind: 'legal_identity',
    label: 'Company legal identity',
    status: 'connected',
    maskedValue: 'OYE IMAGINE PRIVATE LIMITED · GSTIN masked ready',
    scope: 'global',
    syncState: 'ready',
    secretBacked: false,
  },
  {
    id: 'provider_support_contact',
    kind: 'support_contact',
    label: 'Support and contact identity',
    status: 'connected',
    maskedValue: 'hello@oyeimagine.com · +91 8 988 988 988',
    scope: 'global',
    syncState: 'ready',
    secretBacked: false,
  },
  {
    id: 'provider_cms_controller',
    kind: 'cms',
    label: 'CMS and content controller',
    status: 'seeded',
    maskedValue: 'Controller schemas and publish primitives seeded',
    scope: 'workspace',
    syncState: 'pending',
    secretBacked: false,
  },
]

export function getProviderConfigProfiles(): ProviderConfigProfile[] {
  return providerConfigProfiles
}

export function getProviderConfigSummary(): ProviderConfigSummary {
  return {
    totalProfiles: providerConfigProfiles.length,
    connectedCount: providerConfigProfiles.filter((profile) => profile.status === 'connected').length,
    seededCount: providerConfigProfiles.filter((profile) => profile.status === 'seeded').length,
    attentionCount: providerConfigProfiles.filter((profile) => profile.status === 'attention_required').length,
    maskedSecretsCount: providerConfigProfiles.filter((profile) => profile.secretBacked).length,
  }
}

export function getConfigCommandCenterCards() {
  const legal = getLegalIdentitySummary()
  const profile = getOrganizationProfile()
  const channels = getSupportChannels()
  const neejee = getNeejeeCanonicalProfile()
  const summary = getProviderConfigSummary()

  return [
    {
      id: 'card_legal_identity',
      label: 'Legal identity',
      value: legal.legalName,
      summary: `${legal.cin} · GSTIN ${legal.gstin}`,
    },
    {
      id: 'card_support_contact',
      label: 'Support and contact',
      value: profile.contactProfile.supportEmail,
      summary: `${profile.contactProfile.supportPhone} · ${channels.length} channels`,
    },
    {
      id: 'card_provider_state',
      label: 'Provider profile state',
      value: `${summary.connectedCount}/${summary.totalProfiles} ready`,
      summary: `${summary.seededCount} seeded · ${summary.maskedSecretsCount} masked secret-backed profiles`,
    },
    {
      id: 'card_neejee_truth',
      label: 'Neejee canonical profile',
      value: neejee.brandName,
      summary: `${neejee.workspaceId} · ${neejee.verificationStatus}`,
    },
  ]
}