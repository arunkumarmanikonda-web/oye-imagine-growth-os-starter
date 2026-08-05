import { oyeImagineSupportMailLogSeed } from "@/lib/foundation/organization-profile";

export type SupportMailDirection = "inbound" | "outbound";
export type SupportMailStatus = "queued" | "sent" | "delivered" | "failed" | "received";

export interface SupportMailLogRecord {
  id: string;
  channelKey: string;
  direction: SupportMailDirection;
  status: SupportMailStatus;
  subject: string;
  fromEmail: string;
  toEmail: string;
  provider?: string;
  createdAt: string;
}

export interface SupportMailLogSummary {
  total: number;
  queued: number;
  delivered: number;
  failed: number;
  received: number;
  outbound: number;
  inbound: number;
}

export function createSupportMailLogEntry(input: {
  channelKey: string;
  direction: SupportMailDirection;
  status: SupportMailStatus;
  subject: string;
  fromEmail: string;
  toEmail: string;
  provider?: string;
  id?: string;
  createdAt?: string;
}): SupportMailLogRecord {
  return {
    id: input.id ?? `support-log-${Date.now()}`,
    channelKey: input.channelKey,
    direction: input.direction,
    status: input.status,
    subject: input.subject,
    fromEmail: input.fromEmail,
    toEmail: input.toEmail,
    provider: input.provider,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function getSeedSupportMailLogs(): SupportMailLogRecord[] {
  return oyeImagineSupportMailLogSeed.map((entry) => ({
    id: entry.id,
    channelKey: entry.channelKey,
    direction: entry.direction,
    status: entry.status,
    subject: entry.subject,
    fromEmail: entry.fromEmail,
    toEmail: entry.toEmail,
    provider: entry.provider,
    createdAt: entry.createdAt,
  }));
}

export function summarizeSupportMailLogs(logs: SupportMailLogRecord[]): SupportMailLogSummary {
  return {
    total: logs.length,
    queued: logs.filter((log) => log.status === "queued").length,
    delivered: logs.filter((log) => log.status === "delivered" || log.status === "sent").length,
    failed: logs.filter((log) => log.status === "failed").length,
    received: logs.filter((log) => log.status === "received").length,
    outbound: logs.filter((log) => log.direction === "outbound").length,
    inbound: logs.filter((log) => log.direction === "inbound").length,
  };
}

export function supportMailLogNeedsEscalation(summary: SupportMailLogSummary): boolean {
  return summary.failed > 0 || summary.queued > 3;
}
