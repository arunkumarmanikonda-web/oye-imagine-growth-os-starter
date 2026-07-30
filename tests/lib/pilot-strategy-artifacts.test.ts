import { describe, expect, it } from 'vitest';
import {
  canPublishStrategyArtifact,
  canTransitionStrategyArtifact,
  createStrategyArtifactDraft,
} from '../../src/lib/pilot/strategy-artifacts';

describe('pilot strategy artifacts', () => {
  it('creates strategy drafts', () => {
    const artifact = createStrategyArtifactDraft({
      artifactId: 'artifact_1',
      tenantId: 'tenant_1',
      brandId: 'brand_1',
      artifactType: 'strategy_deck',
      title: 'Neejee Growth Strategy',
    });

    expect(artifact.status).toBe('draft');
    expect(artifact.version).toBe(1);
  });

  it('validates status transitions', () => {
    expect(canTransitionStrategyArtifact('draft', 'review')).toBe(true);
    expect(canTransitionStrategyArtifact('draft', 'published')).toBe(false);
    expect(canTransitionStrategyArtifact('approved', 'published')).toBe(true);
  });

  it('only allows publish when approved and populated', () => {
    const artifact = createStrategyArtifactDraft({
      artifactId: 'artifact_2',
      tenantId: 'tenant_1',
      brandId: 'brand_1',
      artifactType: 'strategy_deck',
      title: 'Neejee Strategy',
      sections: [{ title: 'Executive Summary' }],
      summary: { thesis: 'Premium founder-led craft growth' },
    });

    expect(canPublishStrategyArtifact(artifact)).toBe(false);

    artifact.status = 'approved';
    expect(canPublishStrategyArtifact(artifact)).toBe(true);
  });
});