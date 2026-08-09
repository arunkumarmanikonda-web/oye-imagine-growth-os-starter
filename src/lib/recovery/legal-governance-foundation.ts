export type GovernanceDocument = {
  id: string
  title: string
  href: string
  summary: string
  obligations: string[]
}

export type SupportChannel = {
  label: string
  value: string
  href: string
  responseWindow: string
}

export const legalIdentity = {
  legalName: 'OYE IMAGINE PRIVATE LIMITED',
  brandName: 'Oye !magine',
  descriptor: 'Oye !magine AI Growth OS',
  cin: 'U47190UP2025PTC220916',
  pan: 'AAECO6856D',
  tan: 'MRTO02898A',
  gstin: '09AAECO6856D1Z8',
  gstType: 'Regular',
  principalAddress:
    'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida, Gautambuddha Nagar, Uttar Pradesh 201304',
  supportEmail: 'hello@oyeimagine.com',
  supportPhone: '+91 8 988 988 988',
  domain: 'oyeimagine.com',
  jurisdiction: 'Noida, Uttar Pradesh, India'
}

export const governanceDocuments: GovernanceDocument[] = [
  {
    id: 'privacy',
    title: 'Privacy and data handling',
    href: '/privacy',
    summary:
      'Defines how Oye !magine collects, uses, stores and governs client, operator and prospect data across the AI Growth OS.',
    obligations: [
      'Collect only the information needed for onboarding, delivery, support and commercial operations',
      'Restrict access by role, workspace and operational need',
      'Retain support, billing and governance records only for accountable service operation'
    ]
  },
  {
    id: 'terms',
    title: 'Terms of engagement',
    href: '/terms',
    summary:
      'Sets the governed commercial and service-delivery rules for using the Oye !magine AI Growth OS and related managed services.',
    obligations: [
      'Client use is subject to approved commercial scope, billing terms and governed delivery workflows',
      'Operator actions must remain role-aware, auditable and within approved workspaces',
      'Service availability, approvals and escalations follow documented support and governance procedures'
    ]
  },
  {
    id: 'legal',
    title: 'Legal identity and company disclosures',
    href: '/legal',
    summary:
      'Publishes the canonical company identity, tax identifiers, support coordinates and governing jurisdiction for the platform.',
    obligations: [
      'Expose legal identity consistently across public, commercial and support surfaces',
      'Keep tax and company records aligned with public trust surfaces',
      'Maintain a publishable source of truth for client-facing legal disclosures'
    ]
  },
  {
    id: 'support',
    title: 'Support operations and publishing governance',
    href: '/support',
    summary:
      'Explains how support requests, publication changes and platform communications are handled under governed operating procedures.',
    obligations: [
      'Route support through accountable channels with named contact surfaces',
      'Publish legal, trust and contact changes through governed CMS workflows',
      'Keep runtime support instructions aligned with live service operations'
    ]
  }
]

export const supportChannels: SupportChannel[] = [
  {
    label: 'Email support',
    value: legalIdentity.supportEmail,
    href: 'mailto:hello@oyeimagine.com',
    responseWindow: 'Business-day response for onboarding, legal and governed client support'
  },
  {
    label: 'Phone support',
    value: legalIdentity.supportPhone,
    href: 'tel:+918988988988',
    responseWindow: 'Business support line for discovery, onboarding, commercial and escalation requests'
  }
]

export function getLegalGovernanceExperience() {
  return {
    legalIdentity,
    governanceDocuments,
    supportChannels,
    cmsPublicationNote:
      'Legal identity, support operations and governed publication routes are now published as canonical public surfaces.'
  }
}