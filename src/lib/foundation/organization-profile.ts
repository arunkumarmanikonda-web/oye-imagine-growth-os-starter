import type { OrganizationProfile, SupportChannel, SupportMailLog } from "./organization-types";

export const oyeImagineOrganizationProfile: OrganizationProfile = {
  slug: "oye-imagine",
  legalName: "OYE IMAGINE PRIVATE LIMITED",
  tradeName: "OYE IMAGINE PRIVATE LIMITED",
  cin: "U47190UP2025PTC220916",
  pan: "AAECO6856D",
  tan: "MRTO02898A",
  gstin: "09AAECO6856D1Z8",
  incorporationDate: "2025-04-09",
  gstEffectiveDate: "2025-04-24",
  address: {
    line1: "Suite No.11 A-116, Urbtech Trade Centre",
    line2: "Sector-132 Maharishi Nagar",
    city: "Noida",
    district: "Gautambuddha Nagar",
    state: "Uttar Pradesh",
    postalCode: "201304",
    country: "India",
  },
  contactEmails: ["hello@oyeimagine.com"],
  supportMailbox: "hello@oyeimagine.com",
  resendFromEmail: "hello@oyeimagine.com",
  contactPhones: [
    {
      label: "Primary sales and support",
      value: "+91 8 988 988 988",
      isPrimary: true,
    },
  ],
  taxProfile: {
    registrationType: "Regular",
    gstStateCode: "09",
    placeOfBusiness: "Noida, Uttar Pradesh, India",
  },
  legalDocuments: [
    {
      label: "Oye Imagine CIN.pdf",
      url: "https://www.genspark.ai/api/files/s/bzDsbI0v",
      kind: "cin",
    },
    {
      label: "GST-Certificate Oye Imagine.pdf",
      url: "https://www.genspark.ai/api/files/s/plSdtdwu",
      kind: "gst",
    },
  ],
  mailProvider: "resend",
};

export const oyeImagineSupportChannels: SupportChannel[] = [
  {
    key: "primary-email",
    label: "Primary email",
    type: "email",
    destination: "hello@oyeimagine.com",
    provider: "resend",
    isPrimary: true,
  },
  {
    key: "primary-phone",
    label: "Primary phone",
    type: "phone",
    destination: "+91 8 988 988 988",
    provider: "manual",
    isPrimary: true,
  },
];

export const oyeImagineSupportMailLogSeed: SupportMailLog[] = [
  {
    id: "support-log-seed-001",
    channelKey: "primary-email",
    direction: "outbound",
    status: "queued",
    subject: "Welcome and CTA confirmation",
    fromEmail: "hello@oyeimagine.com",
    toEmail: "hello@oyeimagine.com",
    provider: "resend",
    createdAt: "2026-07-31T00:00:00.000Z",
  },
];