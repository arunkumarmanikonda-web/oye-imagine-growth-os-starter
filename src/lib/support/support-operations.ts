import { oyeImagineOrganizationProfile, oyeImagineSupportChannels } from "@/lib/foundation/organization-profile";
import { getResendRuntimeStatus, type ResendRuntimeStatus } from "./resend-runtime";
import {
  getSeedSupportMailLogs,
  summarizeSupportMailLogs,
  type SupportMailLogRecord,
  type SupportMailLogSummary,
} from "./support-mail-log";

export interface SupportChannelSnapshot {
  key: string;
  label: string;
  type: string;
  destination: string;
  isPrimary: boolean;
}

export interface SupportOperationsSnapshot {
  supportMailbox: string;
  primaryPhone: string;
  channelCount: number;
  channels: SupportChannelSnapshot[];
  resend: ResendRuntimeStatus;
  mailLogs: SupportMailLogRecord[];
  mailSummary: SupportMailLogSummary;
  publishGovernance: string[];
  studioHardeningChecklist: string[];
  batchClosureReadiness: string[];
}

export function buildPublishGovernanceRules(): string[] {
  return [
    "All visible UI content must resolve from admin-controlled registries or explicitly approved foundations.",
    "Publish, unpublish, rollback, and delete actions require review awareness.",
    "Support and legal CTA must remain aligned with canonical organization identity.",
    "Batch A closure requires clean route access, CMS registry availability, and support visibility.",
  ];
}

export function buildAdminStudioHardeningChecklist(): string[] {
  return [
    "Support operations linked from config and content studio.",
    "Mail-log summary visible to operators.",
    "Resend runtime status visible before outbound workflow activation.",
    "Publish-control surfaces kept available for admin review paths.",
  ];
}

export function buildSupportEscalationPlan(
  issueType: "resend" | "mail_log" | "publish" | "support_request",
): string[] {
  switch (issueType) {
    case "resend":
      return [
        "Verify RESEND_API_KEY presence.",
        "Verify RESEND_FROM_EMAIL alignment.",
        "Validate support mailbox routing.",
      ];
    case "mail_log":
      return [
        "Inspect support log summary.",
        "Check failed and queued message counts.",
        "Escalate to admin support workspace if thresholds are breached.",
      ];
    case "publish":
      return [
        "Review publish governance rules.",
        "Confirm entity mutation plan and approval path.",
        "Rollback or unpublish if a surface violates approved content policy.",
      ];
    default:
      return [
        "Capture inbound support request.",
        "Route to hello@oyeimagine.com and admin support workspace.",
        "Track closure through support log and operator review.",
      ];
  }
}

export function getSupportOperationsSnapshot(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): SupportOperationsSnapshot {
  const mailLogs = getSeedSupportMailLogs();
  return {
    supportMailbox: oyeImagineOrganizationProfile.supportMailbox,
    primaryPhone: oyeImagineOrganizationProfile.contactPhones[0]?.value ?? "",
    channelCount: oyeImagineSupportChannels.length,
    channels: oyeImagineSupportChannels.map((channel) => ({
      key: channel.key,
      label: channel.label,
      type: channel.type,
      destination: channel.destination,
      isPrimary: Boolean(channel.isPrimary),
    })),
    resend: getResendRuntimeStatus(env),
    mailLogs,
    mailSummary: summarizeSupportMailLogs(mailLogs),
    publishGovernance: buildPublishGovernanceRules(),
    studioHardeningChecklist: buildAdminStudioHardeningChecklist(),
    batchClosureReadiness: [
      "Batch A public shell is in place.",
      "Batch A route protection is active.",
      "Batch A CMS control plane is available.",
      "Support operations and Resend runtime are visible to admin operators.",
    ],
  };
}