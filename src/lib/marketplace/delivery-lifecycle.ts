export type DeliveryLifecycleInput = {
  requestStatus: 'submitted' | 'reviewing' | 'proposed' | 'assigned' | 'in_delivery' | 'accepted' | 'closed';
  acceptedProposal: boolean;
  milestonesTotal: number;
  milestonesCompleted: number;
  revisionsOpen: number;
  disputeOpen: boolean;
  payoutApproved: boolean;
};

export type DeliveryLifecycleSummary = {
  stage: 'proposal' | 'assignment' | 'delivery' | 'acceptance' | 'closed';
  actionable: boolean;
  blockers: string[];
  nextBestAction: string;
};

export function buildDeliveryLifecycleSummary(
  input: DeliveryLifecycleInput,
): DeliveryLifecycleSummary {
  const blockers: string[] = [];

  if (!input.acceptedProposal) {
    return {
      stage: 'proposal',
      actionable: true,
      blockers,
      nextBestAction: 'accept proposal and assign specialist',
    };
  }

  if (input.disputeOpen) {
    blockers.push('dispute open');
  }

  if (input.revisionsOpen > 0) {
    blockers.push('revision pending');
  }

  if (input.milestonesCompleted < input.milestonesTotal) {
    const remaining = input.milestonesTotal - input.milestonesCompleted;
    return {
      stage: 'delivery',
      actionable: true,
      blockers,
      nextBestAction: `complete ${remaining} remaining milestone(s)`,
    };
  }

  if (!input.payoutApproved) {
    return {
      stage: 'acceptance',
      actionable: true,
      blockers,
      nextBestAction: 'approve acceptance and payout readiness',
    };
  }

  return {
    stage: input.requestStatus === 'closed' ? 'closed' : 'acceptance',
    actionable: blockers.length === 0,
    blockers,
    nextBestAction: blockers.length > 0 ? 'resolve delivery blockers' : 'delivery lifecycle ready for closeout',
  };
}

export function deliveryLifecycleReady(summary: DeliveryLifecycleSummary): boolean {
  return summary.blockers.length === 0 && ['acceptance', 'closed'].includes(summary.stage);
}