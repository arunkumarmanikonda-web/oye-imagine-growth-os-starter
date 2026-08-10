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

function getChannelByKind(kind: 'email' | 'phone' | 'address') {
  if (kind === 'email') {
    return supportChannels.find((channel) => String(channel.value).includes('@')) ?? {
      label: 'Email',
      value: 'hello@oyeimagine.com'
    }
  }

  if (kind === 'phone') {
    return supportChannels.find((channel) => String(channel.value).includes('+91')) ?? {
      label: 'Phone',
      value: '+91 8 988 988 988'
    }
  }

  return supportChannels.find((channel) => String(channel.value).includes('Suite')) ?? {
    label: 'Address',
    value: 'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida, Uttar Pradesh 201304'
  }
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
    trustBlock: {
      title: trustSection?.title ?? 'Canonical legal and commercial identity',
      body: trustSection?.description ?? '',
      bullets: trustSection?.bullets ?? [],
      legalName: supportIdentity.legalName,
      taxIdentity: {
        gstin: supportIdentity.gstin,
        pan: organizationProfile.pan,
        tan: organizationProfile.tan,
        cin: organizationProfile.cin
      },
      supportEmail: supportIdentity.supportEmail,
      supportPhone: supportIdentity.supportPhone,
      address: {
        line1: supportIdentity.addressLine1,
        city: supportIdentity.city,
        state: supportIdentity.state,
        postalCode: supportIdentity.postalCode
      }
    },
    promotions: getContentPromotionsByPageSlug('home'),
    faqEntries: getContentFaqEntriesByPageSlug('home')
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
  const emailChannel = getChannelByKind('email')
  const phoneChannel = getChannelByKind('phone')
  const addressChannel = getChannelByKind('address')

  return {
    navigation: getPublicNavigation(),
    hero: {
      title: page?.headline ?? 'Contact',
      body: page?.summary ?? ''
    },
    supportChannels: [
      { label: String(emailChannel.label ?? 'Email'), value: String(emailChannel.value) },
      { label: String(phoneChannel.label ?? 'Phone'), value: String(phoneChannel.value) },
      { label: String(addressChannel.label ?? 'Address'), value: String(addressChannel.value) }
    ],
    legalIdentity: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      addressLine1: organizationProfile.principalPlaceOfBusiness,
      city: '',
      state: '',
      postalCode: ''
    },
    sections: getContentSectionsByPageSlug('contact'),
    faqEntries: getContentFaqEntriesByPageSlug('contact')
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
        description: 'Enter the protected admin workspace through the operator sign-in route.'
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

export function getClientAccessExperience() {
  const experience = getClientLoginExperience()
  return {
    eyebrow: 'Client access',
    ...experience,
  }
}

export function getOperatorAccessExperience() {
  const experience = getAdminLoginExperience()
  return {
    eyebrow: 'Admin workspace',
    ...experience,
  }
}
