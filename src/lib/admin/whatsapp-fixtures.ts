import {
  createWhatsappDraftRecord,
  type WhatsappDraftInput,
  type WhatsappDraftRecord,
} from "@/lib/admin/whatsapp-schema";

export function createDefaultWhatsappDraftFixture(
  overrides: WhatsappDraftInput = {},
): WhatsappDraftRecord {
  return createWhatsappDraftRecord(overrides);
}

export const DEFAULT_WHATSAPP_DRAFT_FIXTURE: WhatsappDraftRecord =
  createDefaultWhatsappDraftFixture();