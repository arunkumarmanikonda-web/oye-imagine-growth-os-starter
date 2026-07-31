export const organizationProfile = {
  brandName: 'Oye !magine',
  legalName: 'OYE IMAGINE PRIVATE LIMITED',
  descriptor: 'AI-native Growth OS',
  domain: 'oyeimagine.com',
  companyType: 'Company limited by shares',
  incorporationDate: '2025-04-09',
  cin: 'U47190UP2025PTC220916',
  pan: 'AAECO6856D',
  tan: 'MRTO02898A',
  gstin: '09AAECO6856D1Z8',
  gstRegistrationType: 'Regular',
  principalPlaceOfBusiness:
    'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida, Gautambuddha Nagar, Uttar Pradesh 201304',
} as const

export const supportChannels = [
  {
    channel: 'email',
    label: 'Support and commercial contact',
    value: 'hello@oyeimagine.com',
    href: 'mailto:hello@oyeimagine.com',
  },
  {
    channel: 'phone',
    label: 'Primary phone',
    value: '+91 8 988 988 988',
    href: 'tel:+918988988988',
  },
  {
    channel: 'address',
    label: 'Principal place of business',
    value: organizationProfile.principalPlaceOfBusiness,
    href: 'https://www.google.com/maps/search/?api=1&query=Urbtech+Trade+Centre+Sector+132+Noida',
  },
] as const

export function getOrganizationTrustBlock() {
  return {
    brandName: organizationProfile.brandName,
    legalName: organizationProfile.legalName,
    descriptor: organizationProfile.descriptor,
    domain: organizationProfile.domain,
    taxIdentity: {
      cin: organizationProfile.cin,
      pan: organizationProfile.pan,
      tan: organizationProfile.tan,
      gstin: organizationProfile.gstin,
      gstRegistrationType: organizationProfile.gstRegistrationType,
    },
    registeredAddress: organizationProfile.principalPlaceOfBusiness,
    supportChannels,
  }
}