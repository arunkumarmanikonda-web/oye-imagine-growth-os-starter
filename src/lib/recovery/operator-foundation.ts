import { organizationProfile, supportChannels } from './organization-profile'
import {
  getContentControllerSnapshot,
  getContentSectionsByPageSlug
} from './content-controller'
import { getLoginHubExperience } from './surface-composer'

export function getOperatorDashboardExperience() {
  return {
    title: 'Operator workspace',
    subtitle: 'Governed admin command center for content, config, and guided access control.',
    cards: [
      {
        title: 'Content studio',
        href: '/admin/content',
        description: 'Govern visible UI, publishing, previews, rollback state, and trust-safe copy.'
      },
      {
        title: 'Config control plane',
        href: '/admin/config',
        description: 'Manage legal profile, provider scaffolding, support identity, and control-plane settings.'
      },
      {
        title: 'Access hub',
        href: '/login',
        description: 'Review public-to-client and public-to-operator directional access flows.'
      }
    ],
    trustBlock: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin
    }
  }
}

export function getOperatorContentStudioExperience() {
  const homepageSections = getContentSectionsByPageSlug('home')
  const loginCards = getLoginHubExperience().cards
  const controllerSnapshot = getContentControllerSnapshot()

  return {
    title: 'Content studio',
    body:
      'The content studio is the governed command center for public-facing content, access-path messaging, and trust-safe UI control.',
    snapshot: {
      homepageSectionCount: homepageSections.length,
      accessPathCount: loginCards.length,
      supportChannelCount: supportChannels.length,
      governedPageCount: controllerSnapshot.totalPages
    },
    controllerSnapshot,
    modules: [
      'Homepage sections',
      'Access-path messaging',
      'Trust and support blocks',
      'Promotion surfaces',
      'FAQ governance',
      'Profile governance'
    ]
  }
}

export function getOperatorConfigExperience() {
  return {
    title: 'Config control plane',
    subtitle: 'Canonical legal identity, provider setup, and governed support configuration.',
    legalProfile: {
      legalName: organizationProfile.legalName,
      cin: organizationProfile.cin,
      pan: organizationProfile.pan,
      tan: organizationProfile.tan,
      gstin: organizationProfile.gstin,
      gstRegistrationType: organizationProfile.gstRegistrationType
    },
    supportChannels: supportChannels.map((channel) => ({
      label: String(channel.label),
      value: String(channel.value)
    })),
    providers: [
      {
        name: 'Resend',
        key: 'resend',
        purpose: 'Transactional email delivery for governed support and platform communications.'
      },
      {
        name: 'Support identity',
        key: 'support',
        purpose: 'Canonical support mailbox and phone identity used across public and operator surfaces.'
      }
    ],
    trustBlock: {
      addressLine1: organizationProfile.principalPlaceOfBusiness.addressLine1,
      city: organizationProfile.principalPlaceOfBusiness.city,
      state: organizationProfile.principalPlaceOfBusiness.state,
      postalCode: organizationProfile.principalPlaceOfBusiness.postalCode
    }
  }
}