export type ResearchFreshnessClass = 'live' | 'daily' | 'weekly' | 'monthly' | 'evergreen';
export type ResearchSourceTier = 'primary' | 'authoritative' | 'reputable' | 'community' | 'unknown';

export type ResearchEvidence = {
  evidenceId: string;
  title: string;
  sourceUri: string;
  sourceTier: ResearchSourceTier;
  publishedAt?: string | null;
  retrievedAt: string;
  freshnessClass: ResearchFreshnessClass;
  claim: string;
  supports: boolean;
};

export type ResearchDecision = {
  recommendation: 'proceed' | 'challenge' | 'insufficient_evidence';
  confidence: number;
  explanation: string;
  evidenceIds: string[];
  contradictoryEvidenceIds: string[];
};

const SOURCE_WEIGHT: Record<ResearchSourceTier, number> = {
  primary: 1,
  authoritative: 0.95,
  reputable: 0.8,
  community: 0.5,
  unknown: 0.25,
};

export function evidenceFreshnessScore(
  evidence: ResearchEvidence,
  now = new Date(),
) {
  const retrieved = new Date(evidence.retrievedAt).getTime();
  if (!Number.isFinite(retrieved)) return 0;
  const ageHours = Math.max(0, (now.getTime() - retrieved) / 3_600_000);
  const maxHours: Record<ResearchFreshnessClass, number> = {
    live: 6,
    daily: 36,
    weekly: 24 * 10,
    monthly: 24 * 45,
    evergreen: 24 * 365 * 3,
  };
  return Math.max(0, 1 - ageHours / maxHours[evidence.freshnessClass]);
}

export function evaluateResearchEvidence(
  evidence: ResearchEvidence[],
  now = new Date(),
): ResearchDecision {
  if (!evidence.length) {
    return {
      recommendation: 'insufficient_evidence',
      confidence: 0,
      explanation: 'No cited evidence is available. Oye !magine must research before recommending an action.',
      evidenceIds: [],
      contradictoryEvidenceIds: [],
    };
  }

  let support = 0;
  let oppose = 0;
  for (const item of evidence) {
    const weight = SOURCE_WEIGHT[item.sourceTier] * evidenceFreshnessScore(item, now);
    if (item.supports) support += weight;
    else oppose += weight;
  }
  const total = support + oppose;
  const confidence = total > 0 ? Math.min(1, Math.abs(support - oppose) / total) : 0;
  const supporting = evidence.filter((item) => item.supports).map((item) => item.evidenceId);
  const contradictory = evidence.filter((item) => !item.supports).map((item) => item.evidenceId);

  if (total < 0.8 || confidence < 0.2) {
    return {
      recommendation: 'insufficient_evidence',
      confidence,
      explanation: 'Available evidence is weak or materially conflicted. Gather more current authoritative sources before acting.',
      evidenceIds: supporting,
      contradictoryEvidenceIds: contradictory,
    };
  }

  if (oppose > support) {
    return {
      recommendation: 'challenge',
      confidence,
      explanation: 'Current evidence contradicts the requested direction. Explain the issue and propose a better evidence-backed approach.',
      evidenceIds: supporting,
      contradictoryEvidenceIds: contradictory,
    };
  }

  return {
    recommendation: 'proceed',
    confidence,
    explanation: 'Current evidence supports the requested direction. Continue with cited assumptions and measurable success criteria.',
    evidenceIds: supporting,
    contradictoryEvidenceIds: contradictory,
  };
}

export function researchMustPrecedeExecution(input: {
  asksForCurrentMarketTruth: boolean;
  changesSpend: boolean;
  changesPublishedContent: boolean;
  strategicDecision: boolean;
}) {
  return Boolean(
    input.asksForCurrentMarketTruth ||
      input.changesSpend ||
      input.changesPublishedContent ||
      input.strategicDecision,
  );
}
