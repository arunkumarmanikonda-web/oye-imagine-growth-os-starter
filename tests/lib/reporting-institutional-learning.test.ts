import { describe, expect, it } from 'vitest';
import {
  createInstitutionalLearningEntry,
  institutionalLearningEntryReady,
  institutionalLearningEntryTenantSafe,
} from '../../src/lib/reporting/institutional-learning';

describe('reporting institutional learning library', () => {
  it('creates a tenant-safe reusable learning entry', () => {
    const entry = createInstitutionalLearningEntry({
      learningId: 'learn-001',
      tenantId: 'tenant_neejee',
      workspaceId: 'workspace_neejee_growth',
      title: 'Landing page trust badge increased CVR',
      summary: 'Trust badges outperformed the control and should be reused on high-intent pages.',
      evidenceRefs: ['report-2026-08', 'exp-001'],
      reusableTags: ['landing_page', 'trust_signal'],
    });

    expect(institutionalLearningEntryReady(entry)).toBe(true);
    expect(institutionalLearningEntryTenantSafe(entry, 'tenant_neejee')).toBe(true);
    expect(institutionalLearningEntryTenantSafe(entry, 'tenant_other')).toBe(false);
  });
});