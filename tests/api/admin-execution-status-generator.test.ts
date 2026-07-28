import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPilot: vi.fn(),
  getStrategy: vi.fn(),
  getLandingPageBrief: vi.fn(),
  getGoogleAdsDraft: vi.fn(),
  getEmailSequenceDraft: vi.fn(),
  getSmsDraft: vi.fn(),
  getWhatsappDraft: vi.fn(),
  getCampaignSummaryDraft: vi.fn(),
  getExecutionPlanDraft: vi.fn(),
  createExecutionStatusDraftRecord: vi.fn(),
  saveExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/pilot-store", () => ({
  getPilot: mocks.getPilot,
}));

vi.mock("@/lib/admin/strategy-store", () => ({
  getStrategy: mocks.getStrategy,
  getStrategyDraft: mocks.getStrategy,
  getStrategyBrief: mocks.getStrategy,
  getSelectedStrategy: mocks.getStrategy,
}));

vi.mock("@/lib/admin/landing-page-store", () => ({
  getLandingPageBrief: mocks.getLandingPageBrief,
}));

vi.mock("@/lib/admin/google-ads-store", () => ({
  getGoogleAdsDraft: mocks.getGoogleAdsDraft,
}));

vi.mock("@/lib/admin/email-sequence-store", () => ({
  getEmailSequenceDraft: mocks.getEmailSequenceDraft,
}));

vi.mock("@/lib/admin/sms-store", () => ({
  getSmsDraft: mocks.getSmsDraft,
}));

vi.mock("@/lib/admin/whatsapp-store", () => ({
  getWhatsappDraft: mocks.getWhatsappDraft,
}));

vi.mock("@/lib/admin/campaign-summary-store", () => ({
  getCampaignSummaryDraft: mocks.getCampaignSummaryDraft,
}));

vi.mock("@/lib/admin/execution-plan-store", () => ({
  getExecutionPlanDraft: mocks.getExecutionPlanDraft,
}));

vi.mock("@/lib/admin/execution-status-schema", () => ({
  createExecutionStatusDraftRecord: mocks.createExecutionStatusDraftRecord,
}));

vi.mock("@/lib/admin/execution-status-store", () => ({
  saveExecutionStatusDraft: mocks.saveExecutionStatusDraft,
}));

import {
  buildExecutionStatusDraftFromPilot,
  generateExecutionStatusDraft,
} from "@/lib/admin/execution-status-generator";

describe("execution-status-generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getPilot.mockReturnValue({
      id: "pilot-demo",
      workspaceId: "workspace-demo",
      companyName: "Acme Health",
      contactName: "Jordan Lee",
    });

    mocks.getStrategy.mockReturnValue({
      pilotId: "pilot-demo",
      primaryGoal: "Book more consultations",
    });

    mocks.getLandingPageBrief.mockReturnValue({
      pilotId: "pilot-demo",
      headline: "Turn more traffic into booked demos",
      valueProp: "Fast setup with measurable ROI",
      generatedAt: "2026-01-01T00:00:00.000Z",
    });

    mocks.getGoogleAdsDraft.mockReturnValue({
      pilotId: "pilot-demo",
      headlines: ["Book more demos fast"],
      descriptions: ["Launch in days, not weeks."],
    });

    mocks.getEmailSequenceDraft.mockReturnValue({
      pilotId: "pilot-demo",
      emails: [
        {
          subject: "Your 14-day launch plan",
          body: "See the quickest path to booked consultations.",
        },
      ],
    });

    mocks.getSmsDraft.mockReturnValue({
      pilotId: "pilot-demo",
      messages: ["Reminder: book your planning call."],
    });

    mocks.getWhatsappDraft.mockReturnValue({
      pilotId: "pilot-demo",
      messages: [
        {
          message: "Here is the rollout snapshot for the coming launch window.",
        },
      ],
    });

    mocks.getCampaignSummaryDraft.mockReturnValue({
      pilotId: "pilot-demo",
      campaignName: "Acme Launch Rollout",
      primaryGoal: "Book more consultations",
      overallStatus: "On track for launch",
      keyMessages: ["Fast launch"],
      nextSteps: ["Approve assets"],
      generatedAt: "2026-01-02T00:00:00.000Z",
    });

    mocks.getExecutionPlanDraft.mockReturnValue({
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      campaignName: "Acme Launch Rollout",
      status: "on-track",
      milestones: ["Finalize launch checklist", "Launch paid traffic"],
      blockers: ["Awaiting final creative approval"],
      checklist: ["Approve assets"],
      generatedAt: "2026-01-03T00:00:00.000Z",
    });

    mocks.createExecutionStatusDraftRecord.mockImplementation((input) => ({
      id: input.id ?? "execution-status-pilot-demo",
      pilotId: input.pilotId ?? "pilot-demo",
      workspaceId: input.workspaceId ?? "workspace-demo",
      generatedAt: input.generatedAt ?? "2026-01-03T00:00:00.000Z",
      lastUpdatedAt: input.lastUpdatedAt ?? "2026-01-03T00:00:00.000Z",
      status: input.status ?? "draft",
      campaignName: input.campaignName ?? "",
      overallStatus: input.overallStatus ?? "",
      completedItems: input.completedItems ?? [],
      inProgressItems: input.inProgressItems ?? [],
      blockedItems: input.blockedItems ?? [],
      upcomingItems: input.upcomingItems ?? [],
      notes: input.notes ?? [],
    }));

    mocks.saveExecutionStatusDraft.mockImplementation((draft) => draft);
  });

  it("builds a deterministic execution status draft", () => {
    const draft = buildExecutionStatusDraftFromPilot("pilot-demo");

    expect(mocks.createExecutionStatusDraftRecord).toHaveBeenCalledTimes(1);
    expect(draft).toMatchObject({
      id: "execution-status-pilot-demo",
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      status: "on-track",
      campaignName: "Acme Launch Rollout",
      overallStatus: "on-track",
    });

    expect(draft.completedItems).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Campaign brief aligned"),
      ]),
    );

    expect(draft.inProgressItems).toEqual(
      expect.arrayContaining([
        expect.stringContaining("In progress"),
      ]),
    );

    expect(draft.blockedItems).toEqual(
      expect.arrayContaining([
        "Awaiting final creative approval",
      ]),
    );

    expect(draft.upcomingItems).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Next: Launch paid traffic"),
      ]),
    );

    expect(draft.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Execution status for Acme Launch Rollout."),
      ]),
    );
  });

  it("persists the generated draft", () => {
    const draft = generateExecutionStatusDraft({ pilotId: "pilot-demo" });

    expect(mocks.saveExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(mocks.saveExecutionStatusDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        pilotId: "pilot-demo",
        campaignName: "Acme Launch Rollout",
      }),
    );

    expect(draft).toMatchObject({
      pilotId: "pilot-demo",
      campaignName: "Acme Launch Rollout",
    });
  });

  it("throws when the pilot is missing", () => {
    mocks.getPilot.mockReturnValue(undefined);

    expect(() => buildExecutionStatusDraftFromPilot("missing-pilot")).toThrow(
      "Pilot not found: missing-pilot",
    );

    expect(mocks.createExecutionStatusDraftRecord).not.toHaveBeenCalled();
    expect(mocks.saveExecutionStatusDraft).not.toHaveBeenCalled();
  });
});