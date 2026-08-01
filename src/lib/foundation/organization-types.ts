export type MailTransportProvider = "resend" | "smtp" | "manual" | "none";

export interface OrganizationAddress {
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrganizationPhone {
  label: string;
  value: string;
  isPrimary?: boolean;
}

export interface LegalDocumentReference {
  label: string;
  url: string;
  kind: "cin" | "gst" | "other";
}

export interface TaxProfile {
  registrationType: string;
  gstStateCode: string;
  placeOfBusiness: string;
}

export interface OrganizationProfile {
  slug: string;
  legalName: string;
  tradeName: string;
  cin: string;
  pan: string;
  tan: string;
  gstin: string;
  incorporationDate: string;
  gstEffectiveDate: string;
  address: OrganizationAddress;
  contactEmails: string[];
  supportMailbox: string;
  resendFromEmail: string;
  contactPhones: OrganizationPhone[];
  taxProfile: TaxProfile;
  legalDocuments: LegalDocumentReference[];
  mailProvider: MailTransportProvider;
}

export interface SupportChannel {
  key: string;
  label: string;
  type: "email" | "phone" | "whatsapp" | "chat";
  destination: string;
  provider?: MailTransportProvider | "manual";
  isPrimary?: boolean;
}

export interface SupportMailLog {
  id: string;
  channelKey: string;
  direction: "inbound" | "outbound";
  status: "queued" | "sent" | "delivered" | "failed" | "received";
  subject: string;
  fromEmail: string;
  toEmail: string;
  provider?: string;
  createdAt: string;
}