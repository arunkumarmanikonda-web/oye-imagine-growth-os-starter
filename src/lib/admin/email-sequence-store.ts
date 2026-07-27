import { createDefaultEmailSequenceDraftFixture } from "@/lib/admin/email-sequence-fixtures";
import {
  createEmailSequenceDraftRecord,
  type EmailSequenceDraftInput,
  type EmailSequenceDraftRecord,
} from "@/lib/admin/email-sequence-schema";

let emailSequenceDraftRecord: EmailSequenceDraftRecord | null = null;

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getEmailSequenceDraft(): EmailSequenceDraftRecord | null {
  return emailSequenceDraftRecord ? cloneRecord(emailSequenceDraftRecord) : null;
}

export function createEmailSequenceDraft(
  input: EmailSequenceDraftInput = {},
): EmailSequenceDraftRecord {
  const next = createEmailSequenceDraftRecord(input);
  emailSequenceDraftRecord = next;
  return cloneRecord(next);
}

export function saveEmailSequenceDraft(
  record: EmailSequenceDraftRecord,
): EmailSequenceDraftRecord {
  const next: EmailSequenceDraftRecord = {
    ...cloneRecord(record),
    lastUpdatedAt: new Date().toISOString(),
  };

  emailSequenceDraftRecord = next;
  return cloneRecord(next);
}

export function updateEmailSequenceDraft(
  patch: EmailSequenceDraftInput,
): EmailSequenceDraftRecord {
  const base = emailSequenceDraftRecord ?? createDefaultEmailSequenceDraftFixture();

  const mergedInput: EmailSequenceDraftInput = {
    ...base,
    ...patch,
    audience: {
      ...base.audience,
      ...patch.audience,
    },
    emails: patch.emails
      ? patch.emails.map((email, index) => ({
          ...base.emails[index],
          ...email,
        }))
      : base.emails.map((email) => ({ ...email })),
    notes: patch.notes ? [...patch.notes] : [...base.notes],
  };

  const next = createEmailSequenceDraftRecord(mergedInput);
  next.generatedAt = base.generatedAt;
  next.lastUpdatedAt = new Date().toISOString();

  emailSequenceDraftRecord = next;
  return cloneRecord(next);
}

export function resetEmailSequenceDraftStore(): void {
  emailSequenceDraftRecord = null;
}