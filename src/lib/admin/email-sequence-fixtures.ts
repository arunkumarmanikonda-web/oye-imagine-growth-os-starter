import {
  createEmailSequenceDraftRecord,
  type EmailSequenceDraftInput,
  type EmailSequenceDraftRecord,
} from "@/lib/admin/email-sequence-schema";

export function createDefaultEmailSequenceDraftFixture(
  overrides: EmailSequenceDraftInput = {},
): EmailSequenceDraftRecord {
  return createEmailSequenceDraftRecord(overrides);
}

export const DEFAULT_EMAIL_SEQUENCE_DRAFT_FIXTURE: EmailSequenceDraftRecord =
  createDefaultEmailSequenceDraftFixture();