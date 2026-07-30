import { describe, expect, it } from 'vitest';
import {
  buildTenantConfigurationSummary,
  tenantConfigurationIsComplete,
} from '../../src/lib/pilot/tenant-configuration';

describe('tenant-configuration', () => {
  it('marks complete tenant configuration as production candidate', () => {
    const summary = buildTenantConfigurationSummary({
      tenantKey: 'neejee',
      brandName: 'Neejee',
      workspaceSlug: 'neejee-pilot',
      region: 'IN',
      defaultCurrency: 'INR',
      features: {
        approvalsEnabled: true,
        subscriptionEnabled: true,
        invoiceEnabled: true,
        auditEnabled: true,
        competitorTrackingEnabled: true,
        activationEnabled: true,
      },
    });

    expect(summary.isReady).toBe(true);
    expect(summary.environment).toBe('production_candidate');
    expect(tenantConfigurationIsComplete(summary)).toBe(true);
  });

  it('reports missing fields for incomplete tenant configuration', () => {
    const summary = buildTenantConfigurationSummary({
      tenantKey: '',
      brandName: 'Neejee',
      workspaceSlug: '',
      region: 'IN',
      defaultCurrency: '',
      features: {
        approvalsEnabled: true,
        subscriptionEnabled: false,
        invoiceEnabled: false,
        auditEnabled: true,
        competitorTrackingEnabled: true,
        activationEnabled: false,
      },
    });

    expect(summary.isReady).toBe(false);
    expect(summary.missingFields).toContain('tenantKey');
    expect(summary.missingFields).toContain('workspaceSlug');
    expect(summary.missingFields).toContain('defaultCurrency');
  });
});