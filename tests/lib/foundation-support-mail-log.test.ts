import { describe, expect, it } from "vitest";
import {
  createSupportMailLogEntry,
  getSeedSupportMailLogs,
  summarizeSupportMailLogs,
} from "../../src/lib/support/support-mail-log";

describe("foundation support mail log", () => {
  it("creates support log entries", () => {
    const entry = createSupportMailLogEntry({
      id: "support-log-001",
      createdAt: "2026-07-31T00:00:00.000Z",
      channelKey: "primary-email",
      direction: "outbound",
      status: "queued",
      subject: "Initial support response",
      fromEmail: "hello@oyeimagine.com",
      toEmail: "client@example.com",
      provider: "resend",
    });

    expect(entry.id).toBe("support-log-001");
    expect(entry.status).toBe("queued");
  });

  it("summarizes seed logs and custom logs", () => {
    const seedLogs = getSeedSupportMailLogs();
    const custom = createSupportMailLogEntry({
      id: "support-log-002",
      createdAt: "2026-07-31T00:10:00.000Z",
      channelKey: "primary-email",
      direction: "inbound",
      status: "received",
      subject: "Need help with access",
      fromEmail: "client@example.com",
      toEmail: "hello@oyeimagine.com",
    });

    const summary = summarizeSupportMailLogs([...seedLogs, custom]);

    expect(summary.total).toBeGreaterThanOrEqual(2);
    expect(summary.inbound).toBeGreaterThanOrEqual(1);
    expect(summary.outbound).toBeGreaterThanOrEqual(1);
  });
});