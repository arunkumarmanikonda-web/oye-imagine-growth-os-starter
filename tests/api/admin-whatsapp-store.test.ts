import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultWhatsappDraftFixture } from "@/lib/admin/whatsapp-fixtures";
import {
  createWhatsappDraft,
  getWhatsappDraft,
  resetWhatsappDraftStore,
  saveWhatsappDraft,
  updateWhatsappDraft,
} from "@/lib/admin/whatsapp-store";

describe("admin whatsapp store", () => {
  beforeEach(() => {
    resetWhatsappDraftStore();
  });

  it("creates a default WhatsApp draft record", () => {
    const record = createWhatsappDraft({
      pilotId: "pilot-wa-1",
      workspaceId: "workspace-wa-1",
    });

    expect(record.pilotId).toBe("pilot-wa-1");
    expect(record.workspaceId).toBe("workspace-wa-1");
    expect(record.status).toBe("draft");
    expect(record.messages).toHaveLength(3);
    expect(getWhatsappDraft()?.pilotId).toBe("pilot-wa-1");
  });

  it("saves a provided WhatsApp draft record", () => {
    const record = createDefaultWhatsappDraftFixture({
      pilotId: "pilot-wa-2",
      workspaceId: "workspace-wa-2",
      senderName: "Avery Stone",
    });

    const saved = saveWhatsappDraft(record);

    expect(saved.senderName).toBe("Avery Stone");
    expect(getWhatsappDraft()?.workspaceId).toBe("workspace-wa-2");
  });

  it("updates an existing WhatsApp draft while preserving generatedAt", () => {
    const created = createWhatsappDraft({
      pilotId: "pilot-wa-3",
      workspaceId: "workspace-wa-3",
    });

    const updated = updateWhatsappDraft({
      senderName: "Jordan Lee",
      audience: {
        persona: "Revenue operations lead",
      },
      messages: [
        {
          body: "Quick note — we can help align your campaign execution across channels with less rewrite work.",
        },
      ],
    });

    expect(updated.senderName).toBe("Jordan Lee");
    expect(updated.audience.persona).toBe("Revenue operations lead");
    expect(updated.messages[0]?.body).toContain("align your campaign execution");
    expect(updated.generatedAt).toBe(created.generatedAt);
  });

  it("resets the store", () => {
    createWhatsappDraft({
      pilotId: "pilot-wa-4",
      workspaceId: "workspace-wa-4",
    });

    resetWhatsappDraftStore();

    expect(getWhatsappDraft()).toBeNull();
  });
});