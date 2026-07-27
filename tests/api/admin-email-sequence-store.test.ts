import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultEmailSequenceDraftFixture } from "@/lib/admin/email-sequence-fixtures";
import {
  createEmailSequenceDraft,
  getEmailSequenceDraft,
  resetEmailSequenceDraftStore,
  saveEmailSequenceDraft,
  updateEmailSequenceDraft,
} from "@/lib/admin/email-sequence-store";

describe("admin email sequence store", () => {
  beforeEach(() => {
    resetEmailSequenceDraftStore();
  });

  it("creates a default draft record", () => {
    const record = createEmailSequenceDraft({
      pilotId: "pilot-email-1",
      workspaceId: "workspace-email-1",
    });

    expect(record.pilotId).toBe("pilot-email-1");
    expect(record.workspaceId).toBe("workspace-email-1");
    expect(record.status).toBe("draft");
    expect(record.emails).toHaveLength(3);
    expect(getEmailSequenceDraft()?.pilotId).toBe("pilot-email-1");
  });

  it("saves a provided draft record", () => {
    const record = createDefaultEmailSequenceDraftFixture({
      pilotId: "pilot-email-2",
      workspaceId: "workspace-email-2",
      sequenceName: "Retention sequence",
    });

    const saved = saveEmailSequenceDraft(record);

    expect(saved.sequenceName).toBe("Retention sequence");
    expect(getEmailSequenceDraft()?.workspaceId).toBe("workspace-email-2");
  });

  it("updates an existing draft while preserving generatedAt", () => {
    const created = createEmailSequenceDraft({
      pilotId: "pilot-email-3",
      workspaceId: "workspace-email-3",
    });

    const updated = updateEmailSequenceDraft({
      sequenceName: "Expansion sequence",
      audience: {
        persona: "Revenue operations lead",
      },
      emails: [
        {
          subject: "A coordinated outbound system for revenue teams",
        },
      ],
    });

    expect(updated.sequenceName).toBe("Expansion sequence");
    expect(updated.audience.persona).toBe("Revenue operations lead");
    expect(updated.emails[0]?.subject).toBe(
      "A coordinated outbound system for revenue teams",
    );
    expect(updated.generatedAt).toBe(created.generatedAt);
  });

  it("resets the store", () => {
    createEmailSequenceDraft({
      pilotId: "pilot-email-4",
      workspaceId: "workspace-email-4",
    });

    resetEmailSequenceDraftStore();

    expect(getEmailSequenceDraft()).toBeNull();
  });
});