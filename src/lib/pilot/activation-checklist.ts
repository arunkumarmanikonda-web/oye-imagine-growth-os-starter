import type {
  BrandProfile,
  OnboardingIntakeDraft,
  StrategyArtifact,
} from './onboarding-types';

export interface ActivationChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  blocker: boolean;
}

export interface ActivationChecklistSummary {
  items: ActivationChecklistItem[];
  completedItems: number;
  totalItems: number;
  readinessPercent: number;
  status: 'draft' | 'in_progress' | 'ready' | 'blocked';
  blockers: string[];
}

export function buildActivationChecklist(input: {
  intake: OnboardingIntakeDraft;
  brandProfile: BrandProfile;
  strategyArtifact: StrategyArtifact | null;
}): ActivationChecklistSummary {
  const items: ActivationChecklistItem[] = [
    {
      key: 'intake_complete',
      label: 'Onboarding intake complete',
      completed: input.intake.completionPercent === 100,
      blocker: true,
    },
    {
      key: 'brand_profile_ready',
      label: 'Brand profile readiness above threshold',
      completed: input.brandProfile.readinessScore >= 70,
      blocker: true,
    },
    {
      key: 'strategy_artifact_present',
      label: 'Strategy artifact generated',
      completed: input.strategyArtifact !== null,
      blocker: true,
    },
    {
      key: 'strategy_artifact_approved',
      label: 'Strategy artifact approved',
      completed: input.strategyArtifact?.status === 'approved' || input.strategyArtifact?.status === 'published',
      blocker: true,
    },
    {
      key: 'requested_services_present',
      label: 'At least one service requested',
      completed: input.intake.servicesRequested.length > 0,
      blocker: false,
    },
  ];

  const completedItems = items.filter((x) => x.completed).length;
  const totalItems = items.length;
  const readinessPercent = Math.round((completedItems / totalItems) * 100);
  const blockers = items.filter((x) => x.blocker && !x.completed).map((x) => x.key);

  let status: 'draft' | 'in_progress' | 'ready' | 'blocked' = 'draft';

  if (completedItems === 0) {
    status = 'draft';
  } else if (blockers.length > 0) {
    status = 'blocked';
  } else if (completedItems === totalItems) {
    status = 'ready';
  } else {
    status = 'in_progress';
  }

  return {
    items,
    completedItems,
    totalItems,
    readinessPercent,
    status,
    blockers,
  };
}