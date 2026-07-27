import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultSmsDraftFixture } from "@/lib/admin/sms-fixtures";
import {
  createSmsDraft,
  getSmsDraft,
  resetSmsDraftStore,
  saveSmsDraft,
  updateSmsDraft,
} from "@/lib/admin/sms-store";

describe("admin sms store", () => {
  beforeEach(() => {
    resetSmsDraftStore();
  });

  it("creates a default SMS draft record", () => {
    const record = createSmsDraft({
      pilotId: "pilot-sms-1",
      workspaceId: "workspace-sms-1",
    });

    expect(record.pilotId).toBe("pilot-sms-1");
    expect(record.workspaceId).toBe("workspace-sms-1");
    expect(record.status).toBe("draft");
    expect(record.messages).toHaveLength(3);
    expect(getSmsDraft()?.pilotId).toBe("pilot-sms-1");
  });

  it("saves a provided SMS draft record", () => {
    const record = createDefaultSmsDraftFixture({
      pilotId: "pilot-sms-2",
      workspaceId: "workspace-sms-2",
      senderName: "Avery Stone",
    });

    const saved = saveSmsDraft(record);

    expect(saved.senderName).toBe("Avery Stone");
    expect(getSmsDraft()?.workspaceId).toBe("workspace-sms-2");
  });

  it("updates an existing SMS draft while preserving generatedAt", () => {
    const created = createSmsDraft({
      pilotId: "pilot-sms-3",
      workspaceId: "workspace-sms-3",
    });

    const updated = updateSmsDraft({
      senderName: "Jordan Lee",
      audience: {
        persona: "Revenue operations lead",
      },
      messages: [
        {
          body: "Quick note — we can help align your campaign execution across channels.",
        },
      ],
    });

    expect(updated.senderName).toBe("Jordan Lee");
    expect(updated.audience.persona).toBe("Revenue operations lead");
    expect(updated.messages[0]?.body).toContain("align your campaign execution");
    expect(updated.generatedAt).toBe(created.generatedAt);
  });

  it("resets the store", () => {
    createSmsDraft({
      pilotId: "pilot-sms-4",
      workspaceId: "workspace-sms-4",
    });

    resetSmsDraftStore();

    expect(getSmsDraft()).toBeNull();
  });
});