import type {
  PersonaDashboardInput,
  PersonaDashboardSnapshot,
} from './closeout-types';

function toneForCount(value: number): 'neutral' | 'positive' | 'warning' | 'critical' {
  if (value <= 0) {
    return 'positive';
  }

  if (value === 1) {
    return 'warning';
  }

  return 'critical';
}

function formatNumber(value: number): string {
  return value.toFixed(2);
}

export function buildPersonaDashboardSnapshot(
  input: PersonaDashboardInput,
): PersonaDashboardSnapshot {
  const baseCards = [
    {
      label: 'ROAS',
      value: formatNumber(input.summary.roas),
      tone: input.summary.roas >= 3 ? 'positive' : 'warning',
    },
    {
      label: 'Revenue',
      value: formatNumber(input.summary.revenue),
      tone: input.summary.revenue > 0 ? 'positive' : 'warning',
    },
    {
      label: 'Conversion Rate',
      value: formatNumber(input.summary.conversionRate),
      tone: input.summary.conversionRate >= 0.02 ? 'positive' : 'warning',
    },
  ] as PersonaDashboardSnapshot['cards'];

  const opsCards = [
    {
      label: 'Recommendations',
      value: String(input.recommendationCount),
      tone: toneForCount(input.recommendationCount),
    },
    {
      label: 'Blockers',
      value: String(input.blockerCount),
      tone: toneForCount(input.blockerCount),
    },
    {
      label: 'Open Approvals',
      value: String(input.openApprovalCount),
      tone: toneForCount(input.openApprovalCount),
    },
    {
      label: 'Incidents',
      value: String(input.activeIncidentCount),
      tone: toneForCount(input.activeIncidentCount),
    },
  ] as PersonaDashboardSnapshot['cards'];

  return {
    title: `${input.brandName} ${input.persona} dashboard`,
    persona: input.persona,
    cards: input.persona === 'client' || input.persona === 'exec'
      ? [...baseCards, opsCards[1]!, opsCards[2]!]
      : [...baseCards, ...opsCards],
    highlights: [
      `${input.brandName} ROAS is ${formatNumber(input.summary.roas)}`,
      `${input.recommendationCount} optimization recommendation(s) currently active`,
      `${input.blockerCount} blocker(s) need resolution`,
    ],
  };
}

export function personaDashboardReady(
  snapshot: PersonaDashboardSnapshot,
): boolean {
  return Boolean(
    snapshot.title &&
    snapshot.cards.length >= 5 &&
    snapshot.highlights.length >= 3,
  );
}

export function personaDashboardSupportsKpiFoundation(
  snapshot: PersonaDashboardSnapshot,
): boolean {
  const labels = snapshot.cards.map((card) => card.label);

  return Boolean(
    personaDashboardReady(snapshot) &&
    labels.includes('ROAS') &&
    labels.includes('Revenue') &&
    labels.includes('Conversion Rate')
  );
}

export function personaDashboardSupportsDecisionTruth(
  snapshot: PersonaDashboardSnapshot,
): boolean {
  const labels = snapshot.cards.map((card) => card.label);

  return Boolean(
    personaDashboardReady(snapshot) &&
    labels.includes('ROAS') &&
    labels.includes('Revenue') &&
    labels.includes('Conversion Rate') &&
    snapshot.highlights.some((highlight) => highlight.toLowerCase().includes('roas'))
  );
}

export function personaDashboardSupportsBatchEClosure(
  snapshot: PersonaDashboardSnapshot,
): boolean {
  return Boolean(
    personaDashboardSupportsDecisionTruth(snapshot) &&
    snapshot.cards.length >= 5 &&
    snapshot.highlights.length >= 3,
  );
}
