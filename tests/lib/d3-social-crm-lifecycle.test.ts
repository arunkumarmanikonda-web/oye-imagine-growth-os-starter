import { describe, expect, it } from "vitest";

import {
  buildSocialCrmLifecycleExecutionSnapshot,
} from "@/lib/recovery/social-crm-lifecycle-foundation";
import { socialCalendarHasCoverage } from "@/lib/execution/social-calendar";

describe("D3 social, reputation, CRM, lifecycle and messaging execution", () => {
  it("builds an execution snapshot with cross-channel coverage", () => {
    const snapshot = buildSocialCrmLifecycleExecutionSnapshot("neejee-pilot");

    expect(snapshot.title).toBe(
      "Social, reputation, CRM, lifecycle and messaging execution",
    );
    expect(snapshot.summary.reputationReviewRequired).toBe(true);
    expect(snapshot.socialCalendar.length).toBe(6);
    expect(
      socialCalendarHasCoverage(snapshot.socialCalendar, [
        "linkedin",
        "instagram",
        "email",
      ]),
    ).toBe(true);

    expect(snapshot.crmStages.length).toBeGreaterThanOrEqual(4);
    expect(snapshot.lifecycleJourneys.length).toBeGreaterThanOrEqual(4);
    expect(snapshot.reputation.guardrails.length).toBeGreaterThanOrEqual(4);

    expect(snapshot.messaging.emailSequence.emails.length).toBe(3);
    expect(snapshot.messaging.smsDraft.messages.length).toBe(3);
    expect(snapshot.messaging.whatsappDraft.messages.length).toBe(3);
  });
});

