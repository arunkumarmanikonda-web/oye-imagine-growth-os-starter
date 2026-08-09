import { generateEmailSequenceDraft } from "@/lib/admin/email-sequence-generator";
import { generateSmsDraft } from "@/lib/admin/sms-generator";
import { generateWhatsappDraft } from "@/lib/admin/whatsapp-generator";
import { buildSocialCalendar } from "@/lib/execution/social-calendar";

export interface ReputationGuardrail {
  title: string;
  owner: string;
  target: string;
}

export interface CrmStage {
  stage: string;
  owner: string;
  primaryGoal: string;
  exitCriteria: string;
}

export interface LifecycleJourney {
  step: string;
  channel: string;
  trigger: string;
  successMetric: string;
}

export interface SocialCrmLifecycleExecutionSnapshot {
  title: string;
  pilotId: string;
  generatedAt: string;
  summary: {
    channels: string[];
    socialPostsPlanned: number;
    emailTouches: number;
    smsTouches: number;
    whatsappTouches: number;
    reputationReviewRequired: boolean;
  };
  crmStages: CrmStage[];
  lifecycleJourneys: LifecycleJourney[];
  reputation: {
    responseSlaHours: number;
    escalationInbox: string;
    guardrails: ReputationGuardrail[];
  };
  socialCalendar: ReturnType<typeof buildSocialCalendar>;
  messaging: {
    emailSequence: ReturnType<typeof generateEmailSequenceDraft>;
    smsDraft: ReturnType<typeof generateSmsDraft>;
    whatsappDraft: ReturnType<typeof generateWhatsappDraft>;
  };
  operatorChecklist: string[];
}

export function buildSocialCrmLifecycleExecutionSnapshot(
  pilotId = "neejee-pilot",
): SocialCrmLifecycleExecutionSnapshot {
  const socialCalendar = buildSocialCalendar({
    brandName: "Neejee",
    campaignTheme: "social proof to CRM capture and lifecycle follow-up",
    primaryCta: "Reply for the tailored execution plan",
    startDate: "2026-08-10",
    weeks: 2,
    cadencePerWeek: 3,
    channels: ["linkedin", "instagram", "email"],
    formats: ["carousel", "reel", "email"],
  });

  const emailSequence = generateEmailSequenceDraft(pilotId);
  const smsDraft = generateSmsDraft(pilotId);
  const whatsappDraft = generateWhatsappDraft(pilotId);

  const crmStages: CrmStage[] = [
    {
      stage: "New lead",
      owner: "Growth operations",
      primaryGoal: "Capture source, offer, and consent state cleanly.",
      exitCriteria: "Lead record created with source attribution and lifecycle tag.",
    },
    {
      stage: "Qualified conversation",
      owner: "Revenue operator",
      primaryGoal: "Confirm fit and route into the right reply sequence.",
      exitCriteria: "Qualification status set and next-step SLA assigned.",
    },
    {
      stage: "Lifecycle nurture",
      owner: "CRM manager",
      primaryGoal: "Keep email, SMS, and WhatsApp follow-up aligned to the same promise.",
      exitCriteria: "At least one channel reply or nurture completion recorded.",
    },
    {
      stage: "Reputation recovery",
      owner: "Support lead",
      primaryGoal: "Resolve negative feedback before amplification damages conversion.",
      exitCriteria: "Public response logged and internal follow-up closed.",
    },
  ];

  const lifecycleJourneys: LifecycleJourney[] = [
    {
      step: "Awareness to opt-in",
      channel: "Social + landing page",
      trigger: "Campaign response or inbound visit",
      successMetric: "Qualified form completion",
    },
    {
      step: "Opt-in to first response",
      channel: "Email",
      trigger: "Lead created in CRM",
      successMetric: "Open or click on first sequence touch",
    },
    {
      step: "Reminder and nudge",
      channel: "SMS",
      trigger: "No reply after first email touch",
      successMetric: "Reply or page revisit",
    },
    {
      step: "High-intent follow-up",
      channel: "WhatsApp",
      trigger: "Qualified lead with direct contact path",
      successMetric: "Conversation started",
    },
  ];

  const reputation = {
    responseSlaHours: 4,
    escalationInbox: "reputation@neejee.example",
    guardrails: [
      {
        title: "Negative public feedback must be acknowledged within SLA.",
        owner: "Support lead",
        target: "First response within 4 hours",
      },
      {
        title: "Escalate legal or brand-risk language before outbound reuse.",
        owner: "Brand operations",
        target: "100% escalation of high-risk mentions",
      },
      {
        title: "CRM suppression rules must block duplicate lifecycle sends after complaint.",
        owner: "CRM manager",
        target: "Zero duplicate sends after suppression",
      },
      {
        title: "Message variants across email, SMS, and WhatsApp must preserve one promise.",
        owner: "Lifecycle operator",
        target: "Weekly alignment review complete",
      },
    ],
  };

  return {
    title: "Social, reputation, CRM, lifecycle and messaging execution",
    pilotId,
    generatedAt: new Date().toISOString(),
    summary: {
      channels: ["linkedin", "instagram", "email", "sms", "whatsapp"],
      socialPostsPlanned: socialCalendar.length,
      emailTouches: emailSequence.emails.length,
      smsTouches: smsDraft.messages.length,
      whatsappTouches: whatsappDraft.messages.length,
      reputationReviewRequired: true,
    },
    crmStages,
    lifecycleJourneys,
    reputation,
    socialCalendar,
    messaging: {
      emailSequence,
      smsDraft,
      whatsappDraft,
    },
    operatorChecklist: [
      "Keep social hooks aligned with the lifecycle promise.",
      "Write CRM tags and consent status before follow-up starts.",
      "Escalate negative sentiment and review requests inside SLA.",
      "Use email first, SMS second, WhatsApp only for qualified direct follow-up.",
      "Record reply outcomes back into the lifecycle stage model.",
    ],
  };
}

