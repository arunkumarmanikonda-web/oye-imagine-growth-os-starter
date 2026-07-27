import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getWhatsappDraft: vi.fn(),
  generateWhatsappDraft: vi.fn(),
}));

vi.mock("@/lib/admin/whatsapp-store", () => ({
  getWhatsappDraft: mocks.getWhatsappDraft,
}));

vi.mock("@/lib/admin/whatsapp-generator", () => ({
  generateWhatsappDraft: mocks.generateWhatsappDraft,
}));

import WhatsappDraftPage from "@/app/admin/whatsapp/[pilotId]/page";

describe("admin whatsapp draft page", () => {
  it("renders a persisted WhatsApp draft", async () => {
    mocks.getWhatsappDraft.mockReturnValue({
      id: "whatsapp-pilot-1",
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      status: "draft",
      senderName: "Jordan at Acme AI",
      goal: "Book more qualified demos",
      messages: [
        { id: "msg-1", body: "Hello from WhatsApp." },
        { id: "msg-2", body: "Quick follow-up." },
      ],
      notes: ["Generated from connected channel assets."],
    });

    const element = await WhatsappDraftPage({
      params: Promise.resolve({ pilotId: "pilot-1" }),
    });

    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("Jordan at Acme AI");
    expect(markup).toContain("Hello from WhatsApp.");
    expect(markup).toContain("Generated from connected channel assets.");
    expect(mocks.generateWhatsappDraft).not.toHaveBeenCalled();
  });

  it("generates a WhatsApp draft when store data is absent or mismatched", async () => {
    mocks.getWhatsappDraft.mockReturnValue({
      id: "whatsapp-other",
      pilotId: "other-pilot",
      workspaceId: "workspace-1",
      status: "draft",
      senderName: "Other Sender",
      goal: "Other Goal",
      messages: [{ id: "msg-x", body: "Other body" }],
      notes: ["Other note"],
    });

    mocks.generateWhatsappDraft.mockReturnValue({
      id: "whatsapp-pilot-2",
      pilotId: "pilot-2",
      workspaceId: "workspace-2",
      status: "draft",
      senderName: "Taylor at Neejee",
      goal: "Increase replies",
      messages: [
        { id: "msg-1", body: "First generated WhatsApp message." },
        { id: "msg-2", body: "Second generated WhatsApp message." },
        { id: "msg-3", body: "Third generated WhatsApp message." },
      ],
      notes: ["Generated on demand."],
    });

    const element = await WhatsappDraftPage({
      params: Promise.resolve({ pilotId: "pilot-2" }),
    });

    const markup = renderToStaticMarkup(element);

    expect(mocks.generateWhatsappDraft).toHaveBeenCalledWith("pilot-2");
    expect(markup).toContain("Taylor at Neejee");
    expect(markup).toContain("First generated WhatsApp message.");
    expect(markup).toContain("Generated on demand.");
  });
});