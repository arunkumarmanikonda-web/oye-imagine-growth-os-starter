import { getOrganizationTrustBlock, supportChannels } from './organization-profile'
import { homepageHero, homepageSections, loginCards } from './content-controller'

export function getPublicHomepageExperience() {
  return {
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Contact', href: '/contact' },
      { label: 'Login', href: '/login' },
    ],
    hero: homepageHero,
    sections: homepageSections,
    trustBlock: getOrganizationTrustBlock(),
  }
}

export function getContactExperience() {
  return {
    hero: {
      eyebrow: 'Contact and support',
      title: 'Reach Oye !magine through governed commercial and support channels.',
      body:
        'This surface establishes centrally managed support contact, legal identity and trust details for the platform spine.',
    },
    trustBlock: getOrganizationTrustBlock(),
    supportChannels,
  }
}

export function getLoginHubExperience() {
  return {
    hero: {
      eyebrow: 'Separate access paths',
      title: 'Choose the right secure entry path for your role.',
      body:
        'Client and operator access are surfaced as separate experience paths instead of one ambiguous mixed-role entry.',
    },
    cards: loginCards,
    trustBlock: getOrganizationTrustBlock(),
  }
}

export function getClientAccessExperience() {
  return {
    eyebrow: 'Client access',
    title: 'Enter the client workspace for invoices, agreements, reports and support.',
    body:
      'This page establishes the dedicated client entry route in Mega Batch A before full session-auth closure is layered in.',
  }
}

export function getOperatorAccessExperience() {
  return {
    eyebrow: 'Operator access',
    title: 'Enter the operator workspace for content control, configuration and governed execution.',
    body:
      'This page establishes the dedicated operator entry route in Mega Batch A before full route-protection closure is layered in.',
  }
}