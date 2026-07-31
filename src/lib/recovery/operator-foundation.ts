import { homepageSections, loginCards } from './content-controller'
import { getOrganizationTrustBlock, organizationProfile, supportChannels } from './organization-profile'

const contentStudioModules = [
  {
    title: 'Page and section registry',
    body: 'Govern visible public and future client-facing content through structured page and section control.',
  },
  {
    title: 'Promotions and CTA control',
    body: 'Centralize offers, banners, CTAs and support-facing conversion surfaces.',
  },
  {
    title: 'Leadership and expert profiles',
    body: 'Move visible people profiles into governed operator control instead of hardcoded UI blocks.',
  },
  {
    title: 'FAQ and help content',
    body: 'Prepare controlled public help, support copy and service framing for governed publishing.',
  },
  {
    title: 'Draft, publish and rollback',
    body: 'Establish content lifecycle foundations before full scheduling, preview and audit expansion.',
  },
  {
    title: 'AI-assisted content operations',
    body: 'Prepare one-click content generation, rewrite and structuring under governed publishing rules.',
  },
] as const

const configModules = [
  {
    title: 'Company legal identity',
    body: 'Govern legal name, CIN, PAN, TAN, GSTIN and registered address from one operator surface.',
  },
  {
    title: 'Support and contact routing',
    body: 'Manage support email, phone, contact trust blocks and future support event routing centrally.',
  },
  {
    title: 'Provider catalog scaffold',
    body: 'Prepare provider readiness for mail, auth, storage and future execution connectors.',
  },
  {
    title: 'Validation and sync states',
    body: 'Track what is seeded, validated, pending live wiring or awaiting guarded rollout.',
  },
] as const

export function getOperatorDashboardExperience() {
  return {
    title: 'Operator workspace',
    eyebrow: 'Protected operator shell foundation',
    summary:
      'This shell is the internal operating layer for content control, configuration, trust governance and future execution modules.',
    cards: [
      {
        title: 'Content studio',
        href: '/admin/content',
        body: 'Manage visible UI content, trust blocks, people profiles, offers and future publishing workflows.',
      },
      {
        title: 'Config control plane',
        href: '/admin/config',
        body: 'Manage company identity, support channels and provider readiness from one governed surface.',
      },
      {
        title: 'Client/operator access split',
        href: '/login',
        body: 'The public login hub now routes into separate client and operator paths rather than one mixed entry.',
      },
    ],
    trustBlock: getOrganizationTrustBlock(),
  }
}

export function getOperatorContentStudioExperience() {
  return {
    title: 'Content studio',
    eyebrow: 'Visible UI control foundation',
    summary:
      'The content studio is the governed command center for public-facing content, future client-facing help surfaces and trust architecture.',
    snapshot: {
      homepageSectionCount: homepageSections.length,
      accessPathCount: loginCards.length,
      supportChannelCount: supportChannels.length,
      controlledEntityFamilies: 6,
    },
    modules: contentStudioModules,
  }
}

export function getOperatorConfigExperience() {
  return {
    title: 'Config control plane',
    eyebrow: 'Company identity and provider governance',
    summary:
      'The config surface centralizes corporate identity, support routing and provider readiness before deeper connector and secret management closure.',
    legalProfile: {
      legalName: organizationProfile.legalName,
      companyType: organizationProfile.companyType,
      incorporationDate: organizationProfile.incorporationDate,
      cin: organizationProfile.cin,
      pan: organizationProfile.pan,
      tan: organizationProfile.tan,
      gstin: organizationProfile.gstin,
      gstRegistrationType: organizationProfile.gstRegistrationType,
      principalPlaceOfBusiness: organizationProfile.principalPlaceOfBusiness,
    },
    supportChannels,
    providers: [
      { name: 'Resend', state: 'seeded_foundation' },
      { name: 'Supabase auth wiring', state: 'pending_batch_a_auth_closure' },
      { name: 'Future growth connectors', state: 'planned' },
    ],
    modules: configModules,
  }
}