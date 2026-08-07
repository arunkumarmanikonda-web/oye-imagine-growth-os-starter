export type ServiceLevelStatus = 'met' | 'breached' | 'missing';
export type OwnerRole = 'PROGRAM_MANAGER' | 'ACCOUNT_MANAGER';

export interface CommunicationAuditInput {
  secureMessages?: number;
  approvalRequests?: number;
  comments?: number;
  notifications?: number;
  decisions?: number;
  escalations?: number;
  historyEntries?: number;
}

export interface ServiceOperationsAuditInput {
  brandName: string;
  responseSlaMinutes?: number | null;
  responseActualMinutes?: number | null;
  resolutionSlaHours?: number | null;
  resolutionActualHours?: number | null;
  deliveryDueAt?: string | null;
  deliveryCompletedAt?: string | null;
  escalationOpenCount?: number;
  blockerCount?: number;
  clientDependencyOpenCount?: number;
  internalDependencyOpenCount?: number;
  communicationLog?: CommunicationAuditInput;
}

export interface ServiceOperationsAuditSummary {
  brandName: string;
  responseSlaStatus: ServiceLevelStatus;
  resolutionSlaStatus: ServiceLevelStatus;
  deliverySlaStatus: ServiceLevelStatus;
  escalationOpenCount: number;
  blockerCount: number;
  clientDependencyOpenCount: number;
  internalDependencyOpenCount: number;
  communicationCoverage: {
    secureMessages: boolean;
    approvalRequests: boolean;
    comments: boolean;
    notifications: boolean;
    decisions: boolean;
    escalations: boolean;
    historyEntries: boolean;
  };
  missingCapabilities: string[];
  operationallyReady: boolean;
  auditReady: boolean;
  nextBestAction: string;
  ownerRole: OwnerRole;
}

function normalizeCount(value?: number | null): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.floor(numeric);
}

function evaluateNumericSla(
  actualValue?: number | null,
  targetValue?: number | null,
): ServiceLevelStatus {
  const actual = Number(actualValue);
  const target = Number(targetValue);

  if (!Number.isFinite(actual) || !Number.isFinite(target) || target <= 0) {
    return 'missing';
  }

  return actual <= target ? 'met' : 'breached';
}

function parseDateValue(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function evaluateDeliverySla(
  completedAt?: string | null,
  dueAt?: string | null,
): ServiceLevelStatus {
  const completed = parseDateValue(completedAt);
  const due = parseDateValue(dueAt);

  if (completed === null || due === null) {
    return 'missing';
  }

  return completed <= due ? 'met' : 'breached';
}

export function buildServiceOperationsAuditSummary(
  input: ServiceOperationsAuditInput,
): ServiceOperationsAuditSummary {
  const brandName = (input.brandName || '').trim() || 'Unknown brand';

  const escalationOpenCount = normalizeCount(input.escalationOpenCount);
  const blockerCount = normalizeCount(input.blockerCount);
  const clientDependencyOpenCount = normalizeCount(input.clientDependencyOpenCount);
  const internalDependencyOpenCount = normalizeCount(input.internalDependencyOpenCount);

  const responseSlaStatus = evaluateNumericSla(
    input.responseActualMinutes,
    input.responseSlaMinutes,
  );

  const resolutionSlaStatus = evaluateNumericSla(
    input.resolutionActualHours,
    input.resolutionSlaHours,
  );

  const deliverySlaStatus = evaluateDeliverySla(
    input.deliveryCompletedAt,
    input.deliveryDueAt,
  );

  const log = input.communicationLog ?? {};
  const communicationCoverage = {
    secureMessages: normalizeCount(log.secureMessages) > 0,
    approvalRequests: normalizeCount(log.approvalRequests) > 0,
    comments: normalizeCount(log.comments) > 0,
    notifications: normalizeCount(log.notifications) > 0,
    decisions: normalizeCount(log.decisions) > 0,
    escalations:
      escalationOpenCount > 0 ? normalizeCount(log.escalations) > 0 : true,
    historyEntries: normalizeCount(log.historyEntries) > 0,
  };

  const missingCapabilities: string[] = [];

  if (responseSlaStatus !== 'met') {
    missingCapabilities.push('responseSla');
  }
  if (resolutionSlaStatus !== 'met') {
    missingCapabilities.push('resolutionSla');
  }
  if (deliverySlaStatus !== 'met') {
    missingCapabilities.push('deliverySla');
  }
  if (blockerCount > 0) {
    missingCapabilities.push('blockerVisibility');
  }
  if (clientDependencyOpenCount > 0) {
    missingCapabilities.push('clientDependencyTracking');
  }
  if (internalDependencyOpenCount > 0) {
    missingCapabilities.push('internalDependencyTracking');
  }
  if (!communicationCoverage.secureMessages) {
    missingCapabilities.push('secureMessages');
  }
  if (!communicationCoverage.approvalRequests) {
    missingCapabilities.push('approvalRequests');
  }
  if (!communicationCoverage.comments) {
    missingCapabilities.push('comments');
  }
  if (!communicationCoverage.notifications) {
    missingCapabilities.push('notifications');
  }
  if (!communicationCoverage.decisions) {
    missingCapabilities.push('decisions');
  }
  if (!communicationCoverage.escalations) {
    missingCapabilities.push('escalations');
  }
  if (!communicationCoverage.historyEntries) {
    missingCapabilities.push('historyEntries');
  }

  const operationallyReady =
    responseSlaStatus === 'met' &&
    resolutionSlaStatus === 'met' &&
    deliverySlaStatus === 'met' &&
    blockerCount === 0 &&
    clientDependencyOpenCount === 0 &&
    internalDependencyOpenCount === 0 &&
    escalationOpenCount === 0;

  const auditReady =
    communicationCoverage.secureMessages &&
    communicationCoverage.approvalRequests &&
    communicationCoverage.comments &&
    communicationCoverage.notifications &&
    communicationCoverage.decisions &&
    communicationCoverage.escalations &&
    communicationCoverage.historyEntries;

  let nextBestAction = `${brandName}: continue service operations execution`;
  let ownerRole: OwnerRole = 'ACCOUNT_MANAGER';

  if (
    blockerCount > 0 ||
    clientDependencyOpenCount > 0 ||
    internalDependencyOpenCount > 0 ||
    escalationOpenCount > 0
  ) {
    const remaining =
      blockerCount +
      clientDependencyOpenCount +
      internalDependencyOpenCount +
      escalationOpenCount;
    nextBestAction = `${brandName}: resolve ${remaining} service ops blocker(s)`;
    ownerRole = 'PROGRAM_MANAGER';
  } else if (!auditReady) {
    nextBestAction = `${brandName}: complete communication audit trail`;
    ownerRole = 'PROGRAM_MANAGER';
  } else if (!operationallyReady) {
    nextBestAction = `${brandName}: recover SLA health`;
    ownerRole = 'PROGRAM_MANAGER';
  }

  return {
    brandName,
    responseSlaStatus,
    resolutionSlaStatus,
    deliverySlaStatus,
    escalationOpenCount,
    blockerCount,
    clientDependencyOpenCount,
    internalDependencyOpenCount,
    communicationCoverage,
    missingCapabilities,
    operationallyReady,
    auditReady,
    nextBestAction,
    ownerRole,
  };
}

export function serviceOperationsNeedAttention(
  summary: ServiceOperationsAuditSummary,
): boolean {
  return !summary.operationallyReady || !summary.auditReady;
}