import {
  createSmsDraftRecord,
  type SmsDraftInput,
  type SmsDraftRecord,
} from "@/lib/admin/sms-schema";

export function createDefaultSmsDraftFixture(
  overrides: SmsDraftInput = {},
): SmsDraftRecord {
  return createSmsDraftRecord(overrides);
}

export const DEFAULT_SMS_DRAFT_FIXTURE: SmsDraftRecord =
  createDefaultSmsDraftFixture();