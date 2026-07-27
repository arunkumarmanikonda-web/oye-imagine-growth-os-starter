export type EmailSequenceDraftStatus = "draft" | "approved";

export interface EmailSequenceAudience {
  persona: string;
  painPoint: string;
  desiredOutcome: string;
}

export interface EmailSequenceDraftEmail {
  id: string;
  subject: string;
  previewText: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  sendDelayDays: number;
  goal: string;
}

export type EmailSequenceDraftEmailInput = Partial<EmailSequenceDraftEmail>;

export interface EmailSequenceDraftRecord {
  id: string;
  pilotId: string;
  workspaceId: string;
  generatedAt: string;
  lastUpdatedAt: string;
  status: EmailSequenceDraftStatus;
  sequenceName: string;
  senderName: string;
  senderEmail: string;
  audience: EmailSequenceAudience;
  strategySummary: string;
  landingPageUrl: string;
  emails: EmailSequenceDraftEmail[];
  notes: string[];
}

export interface EmailSequenceDraftInput
  extends Partial<
    Omit<
      EmailSequenceDraftRecord,
      "generatedAt" | "lastUpdatedAt" | "audience" | "emails" | "notes"
    >
  > {
  audience?: Partial<EmailSequenceAudience>;
  emails?: EmailSequenceDraftEmailInput[];
  notes?: string[];
}

const DEFAULT_EMAILS: EmailSequenceDraftEmail[] = [
  {
    id: "email-1",
    subject: "A faster way to launch your growth system",
    previewText: "See how teams replace scattered marketing work with a single operating system.",
    body:
      "Hi there,\n\nMost teams do not have a strategy problem — they have an execution problem. Work is spread across docs, briefs, landing pages, ads, and email with no single system keeping it aligned.\n\nWe built a simple operating model that turns one strategy into coordinated assets your team can actually ship.\n\nIf that sounds relevant, take a quick look below.",
    ctaLabel: "View the system",
    ctaHref: "https://example.com/landing-page",
    sendDelayDays: 0,
    goal: "Introduce the offer and frame the core problem.",
  },
  {
    id: "email-2",
    subject: "What a coordinated campaign looks like in practice",
    previewText: "From strategy to landing page to ads to email — one brief, less rework.",
    body:
      "Hi there,\n\nA strong campaign gets slower every time the team has to rewrite the same message for a new channel. The fix is not more templates — it is a shared brief that drives each asset.\n\nThat means your landing page, ad copy, and outbound sequence all reinforce the same value proposition without starting from zero each time.\n\nIf you want, I can show you the exact structure.",
    ctaLabel: "See example workflow",
    ctaHref: "https://example.com/workflow",
    sendDelayDays: 3,
    goal: "Show operational value and reduce perceived implementation risk.",
  },
  {
    id: "email-3",
    subject: "Should I send over a tailored draft for your team",
    previewText: "Happy to put together a version mapped to your funnel and offer.",
    body:
      "Hi there,\n\nIf this is close to what your team needs, the next step is easy: I can turn your current positioning into a concrete draft you can react to.\n\nThat usually makes it much easier to decide whether the system fits your workflow.\n\nReply if you want a tailored version and I will send one over.",
    ctaLabel: "Request tailored draft",
    ctaHref: "mailto:founder@example.com",
    sendDelayDays: 7,
    goal: "Prompt a reply or request for a tailored follow-up.",
  },
];

export function createEmailSequenceDraftRecord(
  input: EmailSequenceDraftInput = {},
): EmailSequenceDraftRecord {
  const now = new Date().toISOString();

  const emails =
    input.emails?.map((email, index) => {
      const base = DEFAULT_EMAILS[index] ?? DEFAULT_EMAILS[DEFAULT_EMAILS.length - 1];
      return {
        id: email.id ?? `email-${index + 1}`,
        subject: email.subject ?? base.subject,
        previewText: email.previewText ?? base.previewText,
        body: email.body ?? base.body,
        ctaLabel: email.ctaLabel ?? base.ctaLabel,
        ctaHref: email.ctaHref ?? base.ctaHref,
        sendDelayDays: email.sendDelayDays ?? base.sendDelayDays,
        goal: email.goal ?? base.goal,
      };
    }) ?? DEFAULT_EMAILS.map((email) => ({ ...email }));

  return {
    id: input.id ?? "email-sequence-draft",
    pilotId: input.pilotId ?? "pilot-demo",
    workspaceId: input.workspaceId ?? "workspace-demo",
    generatedAt: now,
    lastUpdatedAt: now,
    status: input.status ?? "draft",
    sequenceName: input.sequenceName ?? "Founder introduction sequence",
    senderName: input.senderName ?? "Growth OS Team",
    senderEmail: input.senderEmail ?? "founder@example.com",
    audience: {
      persona: input.audience?.persona ?? "Founder-led B2B growth team",
      painPoint:
        input.audience?.painPoint ??
        "Campaign execution is fragmented across strategy, pages, ads, and email",
      desiredOutcome:
        input.audience?.desiredOutcome ??
        "Launch coordinated campaigns faster with less rewriting and rework",
    },
    strategySummary:
      input.strategySummary ??
      "Position the product as a practical growth operating system that converts one clear strategy into coordinated execution assets.",
    landingPageUrl: input.landingPageUrl ?? "https://example.com/landing-page",
    emails,
    notes:
      input.notes?.map((note) => `${note}`) ?? [
        "Keep tone practical and operator-focused.",
        "Anchor each email to one concrete value claim.",
        "Use reply-oriented CTA in the final email.",
      ],
  };
}