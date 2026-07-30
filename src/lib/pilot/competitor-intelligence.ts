export interface CompetitorSnapshot {
  competitorName: string;
  relationshipType: 'direct' | 'indirect' | 'aspirational';
  threatScore: number;
  channelStrength: Record<string, number>;
  whitespaceOpportunities: string[];
}

export function normalizeCompetitorName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function rankCompetitorsByThreat(
  snapshots: CompetitorSnapshot[],
): CompetitorSnapshot[] {
  return [...snapshots].sort((a, b) => {
    if (b.threatScore !== a.threatScore) {
      return b.threatScore - a.threatScore;
    }

    const relationshipWeight = {
      direct: 3,
      indirect: 2,
      aspirational: 1,
    };

    return relationshipWeight[b.relationshipType] - relationshipWeight[a.relationshipType];
  });
}

export function extractTopWhitespace(
  snapshots: CompetitorSnapshot[],
  limit = 5,
): string[] {
  const counts = new Map<string, number>();

  for (const snapshot of snapshots) {
    for (const item of snapshot.whitespaceOpportunities) {
      const normalized = item.trim();
      if (!normalized) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => value);
}