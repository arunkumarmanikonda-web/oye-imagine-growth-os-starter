import { createDefaultSmsDraftFixture } from "@/lib/admin/sms-fixtures";
import {
  createSmsDraftRecord,
  type SmsDraftInput,
  type SmsDraftRecord,
} from "@/lib/admin/sms-schema";

let smsDraftRecord: SmsDraftRecord | null = null;

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getSmsDraft(): SmsDraftRecord | null {
  return smsDraftRecord ? cloneRecord(smsDraftRecord) : null;
}

export function createSmsDraft(
  input: SmsDraftInput = {},
): SmsDraftRecord {
  const next = createSmsDraftRecord(input);
  smsDraftRecord = next;
  return cloneRecord(next);
}

export function saveSmsDraft(
  record: SmsDraftRecord,
): SmsDraftRecord {
  const next: SmsDraftRecord = {
    ...cloneRecord(record),
    lastUpdatedAt: new Date().toISOString(),
  };

  smsDraftRecord = next;
  return cloneRecord(next);
}

export function updateSmsDraft(
  patch: SmsDraftInput,
): SmsDraftRecord {
  const base = smsDraftRecord ?? createDefaultSmsDraftFixture();

  const mergedInput: SmsDraftInput = {
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

  const next = createSmsDraftRecord(mergedInput);
  next.generatedAt = base.generatedAt;
  next.lastUpdatedAt = new Date().toISOString();

  smsDraftRecord = next;
  return cloneRecord(next);
}

export function resetSmsDraftStore(): void {
  smsDraftRecord = null;
}