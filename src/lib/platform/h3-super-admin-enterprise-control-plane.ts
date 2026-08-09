export type TenantStatus = 'active' | 'trial' | 'suspended';
export type DeploymentMode = 'shared' | 'dedicated';
export type BrandMode = 'standard' | 'white_label';
export type FeatureFlagState = 'enabled' | 'disabled' | 'pilot';
export type HealthLevel = 'healthy' | 'warning' | 'critical';

export interface TenantRecord {
  tenantId: string;
  displayName: string;
  plan: 'starter' | 'growth' | 'enterprise' | 'partner';
  status: TenantStatus;
  deploymentMode: DeploymentMode;
  brandMode: BrandMode;
  customDomain: boolean;
  ssoReady: boolean;
  scimReady: boolean;
  supportImpersonationEnabled: boolean;
  aiRoutingPolicy: 'shared_default' | 'tenant_pinned' | 'restricted';
  financeOversightEnabled: boolean;
}

export interface FeatureFlagAssignment {
  key: string;
  label: string;
  state: FeatureFlagState;
  source: 'plan' | 'manual_override' | 'experiment';
  owner: string;
}

export interface HealthSignal {
  area: 'platform' | 'integrations' | 'security' | 'finance';
  level: HealthLevel;
  summary: string;
}

export interface ImpersonationRequest {
  actorRole: 'super_admin' | 'operator' | 'support';
  ticketId: string;
  reason: string;
  approvedBy?: string;
}

export interface EnterpriseReadinessAssessment {
  ready: boolean;
  deploymentReady: boolean;
  identityReady: boolean;
  brandIsolationReady: boolean;
  findings: string[];
}

export interface TenantGovernanceSnapshot {
  tenantId: string;
  displayName: string;
  highPrivilegeActionsRequireAudit: boolean;
  activeFeatureFlags: string[];
  pilotFeatureFlags: string[];
  healthSummary: {
    healthy: number;
    warning: number;
    critical: number;
  };
  enterpriseReadiness: EnterpriseReadinessAssessment;
}

export function canImpersonate(request: ImpersonationRequest, tenant: TenantRecord): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (request.actorRole !== 'super_admin') {
    reasons.push('Only super_admin may impersonate tenant users.');
  }

  if (!tenant.supportImpersonationEnabled) {
    reasons.push('Tenant has support impersonation disabled.');
  }

  if (!request.ticketId || request.ticketId.trim().length < 4) {
    reasons.push('Ticket ID is required for impersonation.');
  }

  if (!request.reason || request.reason.trim().length < 10) {
    reasons.push('Reason must be explicit and audit-grade.');
  }

  return {
    allowed: reasons.length === 0,
    reasons,
  };
}

export function assessEnterpriseReadiness(tenant: TenantRecord): EnterpriseReadinessAssessment {
  const findings: string[] = [];

  const deploymentReady =
    tenant.plan === 'enterprise' &&
    (tenant.deploymentMode === 'dedicated' || tenant.deploymentMode === 'shared');

  if (tenant.plan === 'enterprise' && tenant.deploymentMode !== 'dedicated') {
    findings.push('Enterprise tenant should have dedicated deployment readiness reviewed.');
  }

  const identityReady = tenant.ssoReady && tenant.scimReady;
  if (!tenant.ssoReady) {
    findings.push('SSO readiness is incomplete.');
  }
  if (!tenant.scimReady) {
    findings.push('SCIM readiness is incomplete.');
  }

  const brandIsolationReady =
    tenant.brandMode === 'standard' ||
    (tenant.brandMode === 'white_label' && tenant.customDomain);

  if (tenant.brandMode === 'white_label' && !tenant.customDomain) {
    findings.push('White-label tenant requires custom domain readiness.');
  }

  if (tenant.aiRoutingPolicy === 'shared_default' && tenant.plan === 'enterprise') {
    findings.push('Enterprise tenant should not rely on shared default AI routing.');
  }

  if (!tenant.financeOversightEnabled) {
    findings.push('Finance oversight should be enabled for enterprise governance.');
  }

  return {
    ready: findings.length === 0,
    deploymentReady,
    identityReady,
    brandIsolationReady,
    findings,
  };
}

export function buildTenantGovernanceSnapshot(
  tenant: TenantRecord,
  featureFlags: FeatureFlagAssignment[],
  healthSignals: HealthSignal[],
): TenantGovernanceSnapshot {
  const readiness = assessEnterpriseReadiness(tenant);

  const activeFeatureFlags = featureFlags
    .filter((flag) => flag.state === 'enabled')
    .map((flag) => flag.key);

  const pilotFeatureFlags = featureFlags
    .filter((flag) => flag.state === 'pilot')
    .map((flag) => flag.key);

  const healthSummary = healthSignals.reduce(
    (acc, signal) => {
      acc[signal.level] += 1;
      return acc;
    },
    { healthy: 0, warning: 0, critical: 0 },
  );

  return {
    tenantId: tenant.tenantId,
    displayName: tenant.displayName,
    highPrivilegeActionsRequireAudit: true,
    activeFeatureFlags,
    pilotFeatureFlags,
    healthSummary,
    enterpriseReadiness: readiness,
  };
}

export function buildFeatureGovernanceRegister(
  tenants: TenantRecord[],
  featureFlagsByTenant: Record<string, FeatureFlagAssignment[]>,
): Array<{
  tenantId: string;
  displayName: string;
  enabledCount: number;
  pilotCount: number;
  manualOverrideCount: number;
}> {
  return tenants.map((tenant) => {
    const flags = featureFlagsByTenant[tenant.tenantId] ?? [];
    return {
      tenantId: tenant.tenantId,
      displayName: tenant.displayName,
      enabledCount: flags.filter((flag) => flag.state === 'enabled').length,
      pilotCount: flags.filter((flag) => flag.state === 'pilot').length,
      manualOverrideCount: flags.filter((flag) => flag.source === 'manual_override').length,
    };
  });
}

export function buildPortfolioHealthRollup(
  snapshots: TenantGovernanceSnapshot[],
): {
  tenantCount: number;
  enterpriseReadyCount: number;
  criticalTenantCount: number;
  warningTenantCount: number;
} {
  return snapshots.reduce(
    (acc, snapshot) => {
      acc.tenantCount += 1;
      if (snapshot.enterpriseReadiness.ready) {
        acc.enterpriseReadyCount += 1;
      }
      if (snapshot.healthSummary.critical > 0) {
        acc.criticalTenantCount += 1;
      } else if (snapshot.healthSummary.warning > 0) {
        acc.warningTenantCount += 1;
      }
      return acc;
    },
    {
      tenantCount: 0,
      enterpriseReadyCount: 0,
      criticalTenantCount: 0,
      warningTenantCount: 0,
    },
  );
}