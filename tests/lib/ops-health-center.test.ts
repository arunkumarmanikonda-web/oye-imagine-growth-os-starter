import { describe, expect, it } from 'vitest';
import { sortHealthChecks, summarizeHealthChecks } from '../../src/lib/ops/health-center';

describe('ops health center', () => {
  it('summarizes incidents and overall status', () => {
    const summary = summarizeHealthChecks([
      {
        component: 'supabase',
        environment: 'production',
        status: 'healthy',
        severity: 'info',
        message: 'healthy',
        detectedAt: '2026-07-30T10:00:00Z',
      },
      {
        component: 'queue-worker',
        environment: 'production',
        status: 'degraded',
        severity: 'warning',
        message: 'retry backlog rising',
        detectedAt: '2026-07-30T10:05:00Z',
      },
      {
        component: 'ai-gateway',
        environment: 'production',
        status: 'down',
        severity: 'critical',
        message: 'provider timeout',
        detectedAt: '2026-07-30T10:06:00Z',
      },
    ]);

    expect(summary.overallStatus).toBe('down');
    expect(summary.incidentCount).toBe(3);
    expect(summary.criticalCount).toBe(1);
    expect(summary.affectedComponents).toContain('ai-gateway');
  });

  it('sorts by severity and recency', () => {
    const sorted = sortHealthChecks([
      {
        component: 'supabase',
        environment: 'production',
        status: 'degraded',
        severity: 'warning',
        message: 'slow queries',
        detectedAt: '2026-07-30T10:05:00Z',
      },
      {
        component: 'ai-gateway',
        environment: 'production',
        status: 'down',
        severity: 'critical',
        message: 'down',
        detectedAt: '2026-07-30T10:01:00Z',
      },
    ]);

    expect(sorted[0]?.component).toBe('ai-gateway');
  });
});