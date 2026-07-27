export type WhatsappDraftStatus = "draft" | "approved";

export interface WhatsappAudience {
  persona: string;
  painPoint: string;
  desiredOutcome: string;
}

export interface WhatsappMessage {
  id: string;
  body: string;
  sendDelayHours: number;
  goal: string;
}

export type WhatsappMessageInput = Partial<WhatsappMessage>;

export interface WhatsappDraftRecord {
  id: string;
  pilotId: string;
  workspaceId: string;
  generatedAt: string;
  lastUpdatedAt: string;
  status: WhatsappDraftStatus;
  senderName: string;
  audience: WhatsappAudience;
  goal: string;
  messages: WhatsappMessage[];
  notes: string[];
}

export interface WhatsappDraftInput
  extends Partial<
    Omit<
      WhatsappDraftRecord,
      "generatedAt" | "lastUpdatedAt" | "audience" | "messages" | "notes"
    >
  > {
  audience?: Partial<WhatsappAudience>;
  messages?: WhatsappMessageInput[];
  notes?: string[];
}

const DEFAULT_MESSAGES: WhatsappMessage[] = [
  {
    id: "whatsapp-1",
    body:
      "Hi! We help teams turn one strategy into aligned landing pages, ads, email, and follow-up. If useful, I can send a quick overview here.",
    sendDelayHours: 0,
    goal: "Open the conversation with a friendly, low-friction introduction.",
  },
  {
    id: "whatsapp-2",
    body:
      "Quick follow-up — the biggest win is reducing rewrite work across channels so campaigns launch faster with a clearer message.",
    sendDelayHours: 24,
    goal: "Reinforce the practical benefit with slightly more context.",
  },
  {
    id: "whatsapp-3",
    body:
      "If you want, I can put together a tailored draft for your funnel so your team can react to something concrete instead of abstract recommendations.",
    sendDelayHours: 72,
    goal: "Prompt a reply for a tailored next step.",
  },
];

export function createWhatsappDraftRecord(
  input: WhatsappDraftInput = {},
): WhatsappDraftRecord {
  const now = new Date().toISOString();

  const messages =
    input.messages?.map((message, index) => {
      const base = DEFAULT_MESSAGES[index] ?? DEFAULT_MESSAGES[DEFAULT_MESSAGES.length - 1];
      return {
        id: message.id ?? `whatsapp-${index + 1}`,
        body: message.body ?? base.body,
        sendDelayHours: message.sendDelayHours ?? base.sendDelayHours,
        goal: message.goal ?? base.goal,
      };
    }) ?? DEFAULT_MESSAGES.map((message) => ({ ...message }));

  return {
    id: input.id ?? "whatsapp-draft",
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
        "Campaign execution is fragmented across strategy, pages, ads, email, and follow-up",
      desiredOutcome:
        input.audience?.desiredOutcome ??
        "Launch coordinated campaigns faster with less channel-by-channel rewriting",
    },
    goal:
      input.goal ??
      "Start a conversational thread that leads to a tailored follow-up draft.",
    messages,
    notes:
      input.notes?.map((note) => `${note}`) ?? [
        "Keep tone conversational and natural for chat.",
        "Use slightly richer context than SMS, but stay concise.",
        "End the final message with a clear reply prompt.",
      ],
  };
}