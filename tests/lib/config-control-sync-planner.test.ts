import { describe, expect, it } from 'vitest';
import {
  buildGlobalSyncSummary,
  buildProviderSyncPlan,
} from '../../src/lib/config-control/sync-planner';

describe('config-control sync planner', () => {
  it('marks provider ready when all required keys are configured', () => {
    const plan = buildProviderSyncPlan('ga4', [
      'GA4_PROPERTY_ID',
      'GA4_CLIENT_EMAIL',
      'GA4_PRIVATE_KEY',
    ]);

    expect(plan.status).toBe('ready');
    expect(plan.missingRequired.length).toBe(0);
  });

  it('builds a global summary with blocked providers', () => {
    const googleAdsPlan = buildProviderSyncPlan('google_ads', ['GOOGLE_ADS_DEVELOPER_TOKEN']);
    const ga4Plan = buildProviderSyncPlan('ga4', [
      'GA4_PROPERTY_ID',
      'GA4_CLIENT_EMAIL',
      'GA4_PRIVATE_KEY',
    ]);

    const summary = buildGlobalSyncSummary([googleAdsPlan, ga4Plan]);

    expect(summary.readyCount).toBe(1);
    expect(summary.blockedProviders).toContain('google_ads');
  });
});