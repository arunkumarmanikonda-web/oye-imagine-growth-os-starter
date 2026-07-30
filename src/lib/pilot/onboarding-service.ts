import type {
  OnboardingIntakeDraft,
  OnboardingProgressSummary,
  ServiceKey,
} from './onboarding-types';

const VALID_SERVICES: ServiceKey[] = [
  'brand_strategy',
  'website_management',
  'landing_pages',
  'seo',
  'aeo_geo',
  'google_ads',
  'meta_ads',
  'linkedin_ads',
  'youtube',
  'organic_social',
  'creative_production',
  'video_production',
  'email_marketing',
  'analytics_reporting',
  'cro',
  'marketplace',
  'managed_services',
  'whatsapp',
  'sms',
];

export function normalizeWebsiteUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function deriveBrandSlug(companyName: string): string {
  return companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateServices(services: ServiceKey[]): ServiceKey[] {
  const unique = [...new Set(services)];
  const invalid = unique.filter((service) => !VALID_SERVICES.includes(service));

  if (invalid.length > 0) {
    throw new Error(`Unsupported onboarding services: ${invalid.join(', ')}`);
  }

  return unique;
}

export function summarizeOnboardingProgress(
  intake: Pick<
    OnboardingIntakeDraft,
    | 'companyName'
    | 'websiteUrl'
    | 'industry'
    | 'countriesServed'
    | 'servicesRequested'
    | 'legalName'
  >,
): OnboardingProgressSummary {
  const missingFields: string[] = [];

  if (!intake.companyName?.trim()) missingFields.push('companyName');
  if (!intake.legalName?.trim()) missingFields.push('legalName');
  if (!intake.websiteUrl?.trim()) missingFields.push('websiteUrl');
  if (!intake.industry?.trim()) missingFields.push('industry');
  if (!intake.countriesServed?.length) missingFields.push('countriesServed');
  if (!intake.servicesRequested?.length) missingFields.push('servicesRequested');

  const completionPercent = Math.max(
    0,
    Math.min(100, Math.round(((6 - missingFields.length) / 6) * 100)),
  );

  return {
    completionPercent,
    missingFields,
    readyForReview: missingFields.length === 0,
  };
}

export function createOnboardingIntakeDraft(input: {
  intakeId: string;
  tenantId: string;
  companyName: string;
  legalName?: string | null;
  websiteUrl?: string | null;
  industry?: string | null;
  countriesServed?: string[];
  servicesRequested?: ServiceKey[];
  autonomyLevel?: 0 | 1 | 2 | 3 | 4;
  billingCurrency?: string;
  intakePayload?: Record<string, unknown>;
}): OnboardingIntakeDraft {
  const servicesRequested = validateServices(input.servicesRequested ?? []);
  const draft: OnboardingIntakeDraft = {
    intakeId: input.intakeId,
    tenantId: input.tenantId,
    companyName: input.companyName.trim(),
    legalName: input.legalName?.trim() || null,
    websiteUrl: normalizeWebsiteUrl(input.websiteUrl),
    industry: input.industry?.trim() || null,
    countriesServed: (input.countriesServed ?? []).map((x) => x.trim()).filter(Boolean),
    servicesRequested,
    autonomyLevel: input.autonomyLevel ?? 1,
    billingCurrency: input.billingCurrency ?? 'INR',
    status: 'draft',
    intakePayload: input.intakePayload ?? {},
    completionPercent: 0,
  };

  const progress = summarizeOnboardingProgress(draft);
  draft.completionPercent = progress.completionPercent;

  return draft;
}