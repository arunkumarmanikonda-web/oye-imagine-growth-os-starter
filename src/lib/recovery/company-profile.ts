import type {
  OrganizationProfile,
  SupportChannel,
  SupportMailboxRecord,
} from './recovery-types'

export const oyeImagineOrganizationProfile: OrganizationProfile = {
  id: 'org_oye_imagine',
  legalIdentity: {
    legalName: 'OYE IMAGINE PRIVATE LIMITED',
    brandName: 'Oye !magine',
    companyType: 'Company limited by shares',
    incorporationDate: '2025-04-09',
    cin: 'U47190UP2025PTC220916',
    pan: 'AAECO6856D',
    tan: 'MRTO02898A',
    gstin: '09AAECO6856D1Z8',
    gstRegistrationType: 'Regular',
    gstEffectiveDate: '2025-04-24',
    principalPlaceOfBusiness:
      'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida, Gautambuddha Nagar, Uttar Pradesh 201304',
    domain: 'oyeimagine.com',
  },
  contactProfile: {
    primaryEmail: 'hello@oyeimagine.com',
    supportEmail: 'hello@oyeimagine.com',
    primaryPhone: '+91 8 988 988 988',
    supportPhone: '+91 8 988 988 988',
    supportHours: 'Mon-Sat, 10:00-19:00 IST',
    resendFromEmail: 'hello@oyeimagine.com',
  },
  footerIdentityLine:
    'OYE IMAGINE PRIVATE LIMITED · CIN U47190UP2025PTC220916 · GSTIN 09AAECO6856D1Z8',
  trustCopy:
    'Premium AI-native digital growth operating system with legally grounded issuer identity, support visibility, and centrally managed public content.',
  issuerLabel: 'OYE IMAGINE PRIVATE LIMITED',
  agreementPartyLabel: 'OYE IMAGINE PRIVATE LIMITED',
  invoiceIssuerLabel: 'OYE IMAGINE PRIVATE LIMITED',
}

export const oyeImagineSupportChannels: SupportChannel[] = [
  {
    id: 'support_email_primary',
    type: 'email',
    label: 'Primary support email',
    value: 'hello@oyeimagine.com',
    provider: 'Resend',
    purpose: 'CTA, support, billing and contact operations',
    isPrimary: true,
  },
  {
    id: 'support_phone_primary',
    type: 'phone',
    label: 'Primary support phone',
    value: '+91 8 988 988 988',
    provider: 'Voice',
    purpose: 'Public contact and support escalation',
    isPrimary: true,
  },
  {
    id: 'support_contact_form',
    type: 'contact_form',
    label: 'Contact form routing',
    value: '/contact',
    provider: 'Platform inbox',
    purpose: 'Inbound support and consultation capture',
    isPrimary: false,
  },
]

export const oyeImagineSupportMailboxRecords: SupportMailboxRecord[] = [
  {
    id: 'mailbox_001',
    direction: 'inbound',
    subject: 'Need a strategy consultation',
    channelId: 'support_email_primary',
    from: 'prospect@example.com',
    to: 'hello@oyeimagine.com',
    status: 'received',
    summary: 'Prospect requested a strategy consultation and pricing overview.',
    createdAt: '2026-07-29T10:15:00.000Z',
  },
  {
    id: 'mailbox_002',
    direction: 'outbound',
    subject: 'Oye !magine support acknowledgement',
    channelId: 'support_email_primary',
    from: 'hello@oyeimagine.com',
    to: 'prospect@example.com',
    status: 'sent',
    summary: 'Automatic Resend-backed acknowledgement sent to the prospect.',
    createdAt: '2026-07-29T10:18:00.000Z',
  },
]

export function getOrganizationProfile(): OrganizationProfile {
  return oyeImagineOrganizationProfile
}

export function getSupportChannels(): SupportChannel[] {
  return oyeImagineSupportChannels
}

export function getSupportMailboxRecords(): SupportMailboxRecord[] {
  return oyeImagineSupportMailboxRecords
}

export function getLegalIdentitySummary() {
  const legal = oyeImagineOrganizationProfile.legalIdentity

  return {
    legalName: legal.legalName,
    brandName: legal.brandName,
    cin: legal.cin,
    pan: legal.pan,
    tan: legal.tan,
    gstin: legal.gstin,
    companyType: legal.companyType,
    incorporationDate: legal.incorporationDate,
    principalPlaceOfBusiness: legal.principalPlaceOfBusiness,
  }
}

export function getSupportMailboxSummary() {
  return {
    totalMessages: oyeImagineSupportMailboxRecords.length,
    inboundCount: oyeImagineSupportMailboxRecords.filter((record) => record.direction === 'inbound').length,
    outboundCount: oyeImagineSupportMailboxRecords.filter((record) => record.direction === 'outbound').length,
    primarySupportEmail: oyeImagineOrganizationProfile.contactProfile.supportEmail,
    primarySupportPhone: oyeImagineOrganizationProfile.contactProfile.supportPhone,
  }
}