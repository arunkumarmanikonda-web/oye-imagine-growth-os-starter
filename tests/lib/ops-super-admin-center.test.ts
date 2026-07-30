import { describe, expect, it } from 'vitest';
import {
  buildSuperAdminOperationalSnapshot,
  superAdminNeedsAttention,
} from '../../src/lib/ops/super-admin-center';

describe('ops super admin center', () => {
  it('marks the platform critical when incidents are open', () => {
    const snapshot = buildSuperAdminOperationalSnapshot({
      environment: 'production',
      openIncidents: 1,
      degradedComponents: 2,
      pendingLaunchChecks: 1,
      tenantsNearQuota: 3,
      failedPublicationJobs: 1,
    });

    expect(snapshot.overallHealth).toBe('critical');
    expect(superAdminNeedsAttention(snapshot)).toBe(true);
    expect(snapshot.alerts.length).toBeGreaterThan(0);
  });

  it('marks the platform healthy when no issues exist', () => {
    const snapshot = buildSuperAdminOperationalSnapshot({
      environment: 'production',
      openIncidents: 0,
      degradedComponents: 0,
      pendingLaunchChecks: 0,
      tenantsNearQuota: 0,
      failedPublicationJobs: 0,
    });

    expect(snapshot.overallHealth).toBe('healthy');
    expect(superAdminNeedsAttention(snapshot)).toBe(false);
  });
});