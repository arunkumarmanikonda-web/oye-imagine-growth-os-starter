import { buildCommercialContinuitySummary } from '../pilot/commercial-continuity';
import type {
  InvoiceLifecycleStatus,
  OperatorPriority,
} from '../pilot/pilot-operating-types';
import { buildOperatorWorkItems } from '../pilot/operator-workspace';
import {
  buildManagedServicesWorkspaceSnapshot,
  managedWorkspaceHasActionableQueue,
} from './managed-services-workspace';
import { launchReadyForProduction, summarizeLaunchReadiness } from './launch-readiness';

type BridgeStatus = 'ready' | 'blocked';

export interface OperatorLaunchActionBridgeInput {
  brandName: string;
  onboardingCompleted: boolean;
  strategyGenerated: boolean;
  strategyApproved: boolean;
  contractSigned: boolean;
  subscriptionActive: boolean;
  invoiceStatus: InvoiceLifecycleStatus;
  approvalOpenCount: number;
  auditCoverage: number;
  mediaBalanceAmount: number;
  currency: string;
  requestedLaunchDate?: string;
  commercialReviewStatus: BridgeStatus;
  providerReadinessStatus: BridgeStatus;
  activationStatus: BridgeStatus;
  continuityReady: boolean;
  sharedBlockers: string[];
  pendingReports?: number;
  pendingCampaigns?: number;
  pendingStrategyTasks?: number;
}

export interface OperatorLaunchActionBridgeSummary {
  operatorQueueCount: number;
  operatorQueueTypes: string[];
  highestPriority: OperatorPriority;
  activationQueueCount: number;
  queueSummary: {
    openApprovals: number;
    pendingReports: number;
    pendingCampaigns: number;
    pendingStrategyTasks: number;
    activeBlockers: number;
  };
  sharedBlockers: string[];
  nextBestAction: string;
  nextBestActionOwnerRole: string;
  managedQueueActionable: boolean;
  launchReady: boolean;
  blockingChecks: string[];
  continuityReady: boolean;
}

const PRIORITY_ORDER: OperatorPriority[] = ['critical', 'high', 'medium', 'low'];

function highestPriority(items: Array<{ priority: OperatorPriority }>): OperatorPriority {
  for (const priority of PRIORITY_ORDER) {
    if (items.some((item) => item.priority === priority)) {
      return priority;
    }
  }
  return 'low';
}

function toReadinessStatus(status: BridgeStatus): 'pass' | 'fail' {
  return status === 'ready' ? 'pass' : 'fail';
}

export function buildOperatorLaunchActionBridge(
  input: OperatorLaunchActionBridgeInput,
): OperatorLaunchActionBridgeSummary {
  const continuitySummary = buildCommercialContinuitySummary({
    brandName: input.brandName,
    onboardingCompleted: input.onboardingCompleted,
    strategyGenerated: input.strategyGenerated,
    strategyApproved: input.strategyApproved,
    contractSigned: input.contractSigned,
    subscriptionActive: input.subscriptionActive,
    invoiceStatus: input.invoiceStatus,
    approvalOpenCount: input.approvalOpenCount,
    auditCoverage: input.auditCoverage,
    mediaBalanceAmount: input.mediaBalanceAmount,
    currency: input.currency,
  });

  const operatorItems = buildOperatorWorkItems({
    brandName: input.brandName,
    summary: continuitySummary,
    requestedLaunchDate: input.requestedLaunchDate,
  });

  const managedWorkspace = buildManagedServicesWorkspaceSnapshot({
    brandName: input.brandName,
    openApprovals: input.approvalOpenCount,
    pendingReports: input.pendingReports ?? 0,
    pendingCampaigns: input.pendingCampaigns ?? 0,
    pendingStrategyTasks:
      input.pendingStrategyTasks ??
      (continuitySummary.statuses.strategy === 'completed' ? 0 : 1),
    activeBlockers: input.sharedBlockers.length,
  });

  const launchReadiness = summarizeLaunchReadiness([
    {
      category: 'commercial',
      checkName: 'commercial review',
      status: toReadinessStatus(input.commercialReviewStatus),
    },
    {
      category: 'providers',
      checkName: 'provider readiness',
      status: toReadinessStatus(input.providerReadinessStatus),
    },
    {
      category: 'activation',
      checkName: 'activation gate',
      status: toReadinessStatus(input.activationStatus),
    },
    {
      category: 'continuity',
      checkName: 'continuity readiness',
      status: input.continuityReady ? 'pass' : 'fail',
    },
  ]);

  return {
    operatorQueueCount: operatorItems.length,
    operatorQueueTypes: Array.from(new Set(operatorItems.map((item) => item.queueType))),
    highestPriority: highestPriority(operatorItems),
    activationQueueCount: operatorItems.filter((item) => item.queueType === 'activation').length,
    queueSummary: managedWorkspace.queueSummary,
    sharedBlockers: input.sharedBlockers,
    nextBestAction: managedWorkspace.nextBestAction,
    nextBestActionOwnerRole: managedWorkspace.ownerRole,
    managedQueueActionable: managedWorkspaceHasActionableQueue(managedWorkspace),
    launchReady: launchReadyForProduction(launchReadiness),
    blockingChecks: launchReadiness.blockingChecks,
    continuityReady: input.continuityReady,
  };
}
