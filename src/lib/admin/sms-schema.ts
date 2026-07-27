export type SmsDraftStatus = "draft" | "approved";

export interface SmsAudience {
  persona: string;
  painPoint: string;
  desiredOutcome: string;
}

export interface SmsMessage {
  id: string;
  body: string;
  sendDelayHours: number;
  goal: string;
}

export type SmsMessageInput = Partial<SmsMessage>;

export interface SmsDraftRecord {
  id: string;
  pilotId: string;
  workspaceId: string;
  generatedAt: string;
  lastUpdatedAt: string;
  status: SmsDraftStatus;
  senderName: string;
  audience: SmsAudience;
  goal: string;
  messages: SmsMessage[];
  notes: string[];
}

export interface SmsDraftInput
  extends Partial<
    Omit<
      SmsDraftRecord,
      "generatedAt" | "lastUpdatedAt" | "audience" | "messages" | "notes"
    >
  > {
  audience?: Partial<SmsAudience>;
  messages?: SmsMessageInput[];
  notes?: string[];
}

const DEFAULT_MESSAGES: SmsMessage[] = [
  {
    id: "sms-1",
    body:
      "Hi! We help teams turn one strategy into aligned landing pages, ads, and follow-up. Want me to send the short overview?",
    sendDelayHours: 0,
    goal: "Open the conversation with a concise value proposition.",
  },
  {
    id: "sms-2",
    body:
      "Quick follow-up — the main win is less rewrite work across channels and faster campaign launch. Worth a quick look?",
    sendDelayHours: 24,
    goal: "Reinforce the core benefit and prompt engagement.",
  },
  {
    id: "sms-3",
    body:
      "If helpful, I can send a tailored draft for your funnel so your team can react to something concrete.",
    sendDelayHours: 72,
    goal: "Prompt a reply for a tailored next step.",
  },
];

export function createSmsDraftRecord(
  input: SmsDraftInput = {},
): SmsDraftRecord {
  const now = new Date().toISOString();

  const messages =
    input.messages?.map((message, index) => {
      const base = DEFAULT_MESSAGES[index] ?? DEFAULT_MESSAGES[DEFAULT_MESSAGES.length - 1];
      return {
        id: message.id ?? `sms-${index + 1}`,
        body: message.body ?? base.body,
        sendDelayHours: message.sendDelayHours ?? base.sendDelayHours,
        goal: message.goal ?? base.goal,
      };
    }) ?? DEFAULT_MESSAGES.map((message) => ({ ...message }));

  return {
    id: input.id ?? "sms-draft",
    pilotId: input.pilotId ?? "pilot-demo",
    workspaceId: input.workspaceId ?? "workspace-demo",
    generatedAt: now,
    lastUpdatedAt: now,
    status: input.status ?? "draft",
    senderName: input.senderName ?? "Growth OS Team",
    audience: {
      persona: input.audience?.persona ?? "Founder-led B2B growth team",
      painPoint:
        input.audience?.painPoint ??
        "Campaign execution is fragmented across strategy, pages, ads, and follow-up",
      desiredOutcome:
        input.audience?.desiredOutcome ??
        "Launch coordinated campaigns faster with less channel-by-channel rewriting",
    },
    goal:
      input.goal ??
      "Start a reply-oriented conversation that leads to a tailored follow-up draft.",
    messages,
    notes:
      input.notes?.map((note) => `${note}`) ?? [
        "Keep each SMS concise and conversational.",
        "Focus on one idea per message.",
        "Use the final message to request a reply.",
      ],
  };
}