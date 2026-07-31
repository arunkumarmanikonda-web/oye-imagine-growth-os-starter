import {
  contentPages,
  getContentFaqEntriesByPageSlug,
  getContentPageBySlug,
  getContentPromotionsByPageSlug,
  getContentSectionsByPageSlug,
  getSupportIdentitySnapshot
} from './content-controller'
import { organizationProfile, supportChannels } from './organization-profile'

function getPublicNavigation() {
  return contentPages
    .filter((page) => page.surface === 'public')
    .map((page) => ({
      label: page.navigationLabel,
      href: page.path
    }))
}

function getSupportChannelValue(matchText: string, fallback: string) {
  const channel = supportChannels.find((item) => String(item.value).includes(matchText))
  return channel ? String(channel.value) : fallback
}

export function getPublicHomepageExperience() {
  const homePage = getContentPageBySlug('home')
  const homepageSections = getContentSectionsByPageSlug('home')
  const heroSection = homepageSections.find((section) => section.key === 'hero')
  const trustSection = homepageSections.find((section) => section.key === 'trust')
  const supportIdentity = getSupportIdentitySnapshot()

  return {
    navigation: getPublicNavigation(),
    hero: {
      eyebrow: heroSection?.eyebrow ?? 'Oye !magine',
      title: heroSection?.title ?? homePage?.headline ?? 'AI-native Growth OS',
      body: heroSection?.description ?? homePage?.summary ?? '',
      ctaLabel: heroSection?.ctaLabel ?? homePage?.ctaLabel ?? 'Explore',
      ctaHref: heroSection?.ctaHref ?? homePage?.ctaHref ?? '/marketplace'
    },
    trust: {
      title: trustSection?.title ?? 'Canonical legal and commercial identity',
      body: trustSection?.description ?? '',
      bullets: trustSection?.bullets ?? [],
      legalName: supportIdentity.legalName,
      gstin: supportIdentity.gstin,
      supportEmail: supportIdentity.supportEmail,
      supportPhone: supportIdentity.supportPhone
    },
    promotions: getContentPromotionsByPageSlug('home'),
    faqEntries: getContentFaqEntriesByPageSlug('home'),
    legalIdentity: supportIdentity
  }
}

export function getMarketplaceExperience() {
  const page = getContentPageBySlug('marketplace')
  return {
    navigation: getPublicNavigation(),
    hero: {
      title: page?.headline ?? 'Marketplace',
      body: page?.summary ?? '',
      ctaLabel: page?.ctaLabel ?? 'Explore marketplace',
      ctaHref: page?.ctaHref ?? '/marketplace'
    },
    sections: getContentSectionsByPageSlug('marketplace'),
    promotions: getContentPromotionsByPageSlug('marketplace'),
    faqEntries: getContentFaqEntriesByPageSlug('marketplace')
  }
}

export function getContactExperience() {
  const page = getContentPageBySlug('contact')
  const supportIdentity = getSupportIdentitySnapshot()

  return {
    navigation: getPublicNavigation(),
    hero: {
      title: page?.headline ?? 'Contact',
      body: page?.summary ?? ''
    },
    support: {
      email: getSupportChannelValue('@', 'hello@oyeimagine.com'),
      phone: getSupportChannelValue('+91', '+91 8 988 988 988'),
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      addressLine1: organizationProfile.principalPlaceOfBusiness.addressLine1,
      city: organizationProfile.principalPlaceOfBusiness.city,
      state: organizationProfile.principalPlaceOfBusiness.state,
      postalCode: organizationProfile.principalPlaceOfBusiness.postalCode
    },
    sections: getContentSectionsByPageSlug('contact'),
    faqEntries: getContentFaqEntriesByPageSlug('contact'),
    legalIdentity: supportIdentity
  }
}

export function getLoginHubExperience() {
  const page = getContentPageBySlug('login')

  return {
    title: page?.headline ?? 'Access hub',
    body: page?.summary ?? '',
    cards: [
      {
        label: 'Client access',
        href: '/login/client',
        description: 'Enter the client workspace through the role-safe client sign-in route.'
      },
      {
        label: 'Admin workspace',
        href: '/login/admin',
        description: 'Enter the protected operator workspace through the operator sign-in route.'
      }
    ]
  }
}

export function getClientLoginExperience() {
  return {
    title: 'Client sign in',
    body: 'Role-safe entry for authenticated client access bound to canonical workspace truth.',
    form: {
      action: '/client',
      submitLabel: 'Enter client workspace'
    }
  }
}

export function getAdminLoginExperience() {
  return {
    title: 'Operator sign in',
    body: 'Protected operator entry for content, support, config, and runtime governance surfaces.',
    form: {
      action: '/admin',
      submitLabel: 'Enter operator workspace'
    }
  }
}