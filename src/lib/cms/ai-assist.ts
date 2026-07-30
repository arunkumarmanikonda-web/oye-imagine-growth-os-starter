export type CmsAssistEntityType = "page" | "promotion" | "person" | "faq" | "cta";

export interface CmsAiSuggestionBundle {
  entityType: CmsAssistEntityType;
  title: string;
  summary: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  seoTitle: string;
  seoDescription: string;
  complianceNotes: string[];
}

function normalizePrompt(prompt: string): string {
  const trimmed = prompt.trim();
  return trimmed.length > 0 ? trimmed : "Premium AI-native digital marketing services";
}

function toHeadline(prompt: string): string {
  const normalized = normalizePrompt(prompt);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function listCmsAiCapabilities(): string[] {
  return [
    "Draft homepage and marketplace copy",
    "Generate CTA variants",
    "Generate leadership and expert profile summaries",
    "Generate FAQ answers",
    "Generate promo and banner copy",
    "Generate SEO title and meta description suggestions",
  ];
}

export function buildCmsAiSuggestionBundle(input: {
  entityType: CmsAssistEntityType;
  prompt: string;
  supportEmail?: string;
}): CmsAiSuggestionBundle {
  const normalized = normalizePrompt(input.prompt);
  const headline = toHeadline(normalized);
  const supportEmail = input.supportEmail ?? "hello@oyeimagine.com";

  return {
    entityType: input.entityType,
    title: `${headline} | Oye !magine`,
    summary: `${headline} tailored for a premium, AI-enabled, enterprise-ready digital marketing operating surface.`,
    bullets: [
      `Position ${headline} around trust, clarity, and premium execution.`,
      "Keep the tone ultra-corporate, clean, and user-friendly.",
      "Align copy with admin-controlled CMS governance and publish control.",
    ],
    ctaLabel: input.entityType === "faq" ? "Contact support" : "Talk to Oye !magine",
    ctaHref: `mailto:${supportEmail}`,
    seoTitle: `${headline} | AI-native digital marketing services`,
    seoDescription: `${headline} delivered through an AI-enabled digital marketing operating system with clear CTA, premium UX, and admin-controlled publishing.`,
    complianceNotes: [
      "Review legal, tax, and claims language before publish.",
      "Confirm commercial and delivery promises match approved scope.",
      "Keep support and escalation CTA aligned with hello@oyeimagine.com.",
    ],
  };
}