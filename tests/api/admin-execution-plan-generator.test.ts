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
  createExecutionPlanDraftRecord: vi.fn(),
  saveExecutionPlanDraft: vi.fn(),
}));

vi.mock("@/lib/admin/pilot-store", () => ({
  getPilot: mocks.getPilot,
}));

vi.mock("@/lib/admin/strategy-store", () => ({
  getStrategy: mocks.getStrategy,
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

vi.mock("@/lib/admin/execution-plan-schema", () => ({
  createExecutionPlanDraftRecord: mocks.createExecutionPlanDraftRecord,
}));

vi.mock("@/lib/admin/execution-plan-store", () => ({
  saveExecutionPlanDraft: mocks.saveExecutionPlanDraft,
}));

import {
  buildExecutionPlanDraftFromPilot,
  generateExecutionPlanDraft,
} from "@/lib/admin/execution-plan-generator";

describe("execution-plan-generator", () => {
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
      coreOffer: "Free onboarding audit",
      launchWindow: "Next 14 days",
    });

    mocks.getLandingPageBrief.mockReturnValue({
      pilotId: "pilot-demo",
      headline: "Turn more traffic into booked demos",
      valueProp: "Fast setup with measurable ROI",
      callToAction: "Book a strategy call",
      generatedAt: "2026-01-01T00:00:00.000Z",
    });

    mocks.getGoogleAdsDraft.mockReturnValue({
      pilotId: "pilot-demo",
      headlines: ["Book more demos fast", "Free onboarding audit"],
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
      messages: ["Quick reminder: book your launch planning call."],
    });

    mocks.getWhatsappDraft.mockReturnValue({
      pilotId: "pilot-demo",
      messages: [
        {
          message:
            "Hi Jordan — here is the rollout plan to turn more traffic into booked demos.",
        },
      ],
    });

    mocks.getCampaignSummaryDraft.mockReturnValue({
      pilotId: "pilot-demo",
      campaignName: "Acme Health Consultation Push",
      channels: ["Landing Page", "Google Ads", "Email", "SMS", "WhatsApp"],
      keyMessages: ["Fast launch", "Free onboarding audit"],
      nextSteps: ["Approve copy", "Launch channels", "Review week-one performance"],
      notes: "Keep the launch tight and measurable.",
      generatedAt: "2026-01-02T00:00:00.000Z",
    });

    mocks.createExecutionPlanDraftRecord.mockImplementation((input) => ({
      id: input.id ?? "execution-plan-pilot-demo",
      pilotId: input.pilotId ?? "pilot-demo",
      workspaceId: input.workspaceId ?? "workspace-demo",
      generatedAt: input.generatedAt ?? "2026-01-02T00:00:00.000Z",
      lastUpdatedAt: input.lastUpdatedAt ?? "2026-01-02T00:00:00.000Z",
      status: input.status ?? "draft",
      campaignName: input.campaignName ?? "",
      launchWindow: input.launchWindow ?? "",
      milestones: input.milestones ?? [],
      owners: input.owners ?? [],
      blockers: input.blockers ?? [],
      checklist: input.checklist ?? [],
      notes: input.notes ?? "",
    }));

    mocks.saveExecutionPlanDraft.mockImplementation((draft) => draft);
  });

  it("builds a deterministic execution-plan draft", () => {
    const draft = buildExecutionPlanDraftFromPilot("pilot-demo");

    expect(mocks.createExecutionPlanDraftRecord).toHaveBeenCalledTimes(1);
    expect(draft).toMatchObject({
      id: "execution-plan-pilot-demo",
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      status: "draft",
      campaignName: "Acme Health Consultation Push",
      launchWindow: "Next 14 days",
      notes: expect.stringContaining("Primary goal: Book more consultations."),
    });

    expect(draft.milestones).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Finalize"),
        expect.stringContaining("Launch paid traffic"),
        expect.stringContaining("Activate the email sequence"),
      ]),
    );

    expect(draft.owners).toEqual(
      expect.arrayContaining([
        "Jordan Lee (pilot owner)",
        "Landing page owner",
        "Paid media owner",
        "Lifecycle email owner",
      ]),
    );

    expect(draft.checklist).toEqual(
      expect.arrayContaining([
        "Approve copy",
        "Launch channels",
        expect.stringContaining("Confirm campaign goal"),
      ]),
    );
  });

  it("persists the generated draft", () => {
    const draft = generateExecutionPlanDraft({ pilotId: "pilot-demo" });

    expect(mocks.saveExecutionPlanDraft).toHaveBeenCalledTimes(1);
    expect(mocks.saveExecutionPlanDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        pilotId: "pilot-demo",
        campaignName: "Acme Health Consultation Push",
      }),
    );

    expect(draft).toMatchObject({
      pilotId: "pilot-demo",
      campaignName: "Acme Health Consultation Push",
    });
  });

  it("throws when the pilot is missing", () => {
    mocks.getPilot.mockReturnValue(undefined);

    expect(() => buildExecutionPlanDraftFromPilot("missing-pilot")).toThrow(
      "Pilot not found: missing-pilot",
    );

    expect(mocks.createExecutionPlanDraftRecord).not.toHaveBeenCalled();
    expect(mocks.saveExecutionPlanDraft).not.toHaveBeenCalled();
  });
});