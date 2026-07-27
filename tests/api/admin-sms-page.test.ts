import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { getSmsDraftMock, generateSmsDraftMock } = vi.hoisted(() => ({
  getSmsDraftMock: vi.fn(),
  generateSmsDraftMock: vi.fn(),
}));

vi.mock("@/lib/admin/sms-store", () => ({
  getSmsDraft: getSmsDraftMock,
}));

vi.mock("@/lib/admin/sms-generator", () => ({
  generateSmsDraft: generateSmsDraftMock,
}));

vi.mock("@/app/admin/sms/[pilotId]/regenerate-button", () => ({
  default: () => null,
}));

import { createDefaultSmsDraftFixture } from "@/lib/admin/sms-fixtures";
import SmsDraftPage from "@/app/admin/sms/[pilotId]/page";

describe("admin sms draft page", () => {
  beforeEach(() => {
    getSmsDraftMock.mockReset();
    generateSmsDraftMock.mockReset();
  });

  it("renders a persisted SMS draft", async () => {
    getSmsDraftMock.mockReturnValue(
      createDefaultSmsDraftFixture({
        pilotId: "pilot-sms-1",
        workspaceId: "workspace-sms-1",
        senderName: "Avery Stone",
        goal: "Start a reply-oriented conversation.",
        audience: {
          persona: "Founder-led B2B growth team",
          painPoint: "Campaign execution is fragmented",
          desiredOutcome: "Launch coordinated campaigns faster",
        },
        messages: [
          {
            id: "sms-1",
            body: "Launch your growth system faster",
            sendDelayHours: 0,
            goal: "Open the conversation",
          },
        ],
        notes: ["Persisted note"],
      }),
    );

    const element = await SmsDraftPage({
      params: Promise.resolve({ pilotId: "pilot-sms-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(generateSmsDraftMock).not.toHaveBeenCalled();
    expect(html).toContain("Avery Stone");
    expect(html).toContain("Launch your growth system faster");
    expect(html).toContain("Persisted note");
  });

  it("generates an SMS draft when store data is absent or mismatched", async () => {
    getSmsDraftMock.mockReturnValue(
      createDefaultSmsDraftFixture({
        pilotId: "pilot-other",
        workspaceId: "workspace-other",
      }),
    );

    generateSmsDraftMock.mockReturnValue(
      createDefaultSmsDraftFixture({
        pilotId: "pilot-sms-2",
        workspaceId: "workspace-sms-2",
        senderName: "Jordan Lee",
        goal: "Prompt a reply for a tailored next step.",
        messages: [
          {
            id: "sms-1",
            body: "Run coordinated campaigns with less rework",
            sendDelayHours: 0,
            goal: "Show operational value",
          },
        ],
        notes: ["Generated note"],
      }),
    );

    const element = await SmsDraftPage({
      params: Promise.resolve({ pilotId: "pilot-sms-2" }),
    });
    const html = renderToStaticMarkup(element);

    expect(generateSmsDraftMock).toHaveBeenCalledWith("pilot-sms-2");
    expect(html).toContain("Jordan Lee");
    expect(html).toContain("Run coordinated campaigns with less rework");
    expect(html).toContain("Generated note");
  });
});