import { createDefaultWhatsappDraftFixture } from "@/lib/admin/whatsapp-fixtures";
import {
  createWhatsappDraftRecord,
  type WhatsappDraftInput,
  type WhatsappDraftRecord,
} from "@/lib/admin/whatsapp-schema";

let whatsappDraftRecord: WhatsappDraftRecord | null = null;

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getWhatsappDraft(): WhatsappDraftRecord | null {
  return whatsappDraftRecord ? cloneRecord(whatsappDraftRecord) : null;
}

export function createWhatsappDraft(
  input: WhatsappDraftInput = {},
): WhatsappDraftRecord {
  const next = createWhatsappDraftRecord(input);
  whatsappDraftRecord = next;
  return cloneRecord(next);
}

export function saveWhatsappDraft(
  record: WhatsappDraftRecord,
): WhatsappDraftRecord {
  const next: WhatsappDraftRecord = {
    ...cloneRecord(record),
    lastUpdatedAt: new Date().toISOString(),
  };

  whatsappDraftRecord = next;
  return cloneRecord(next);
}

export function updateWhatsappDraft(
  patch: WhatsappDraftInput,
): WhatsappDraftRecord {
  const base = whatsappDraftRecord ?? createDefaultWhatsappDraftFixture();

  const mergedInput: WhatsappDraftInput = {
    ...base,
    ...patch,
    audience: {
      ...base.audience,
      ...patch.audience,
    },
    messages: patch.messages
      ? patch.messages.map((message, index) => ({
          ...base.messages[index],
          ...message,
        }))
      : base.messages.map((message) => ({ ...message })),
    notes: patch.notes ? [...patch.notes] : [...base.notes],
  };

  const next = createWhatsappDraftRecord(mergedInput);
  next.generatedAt = base.generatedAt;
  next.lastUpdatedAt = new Date().toISOString();

  whatsappDraftRecord = next;
  return cloneRecord(next);
}

export function resetWhatsappDraftStore(): void {
  whatsappDraftRecord = null;
}