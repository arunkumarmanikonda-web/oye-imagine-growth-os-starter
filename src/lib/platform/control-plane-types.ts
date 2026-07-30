export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;
export type ScopeType = 'platform' | 'tenant' | 'brand' | 'workspace' | 'campaign';
export type EntitlementState = 'enabled' | 'disabled' | 'trial' | 'gated';
export type ApprovalMode = 'any' | 'all' | 'sequential';
export type PermissionKey = string;
export type AiProviderType =
  | 'llm'
  | 'embedding'
  | 'image'
  | 'video'
  | 'audio'
  | 'reranker'
  | 'workflow';

export interface FeatureFlagDefinition {
  flagKey: string;
  scopeType: Exclude<ScopeType, 'campaign'>;
  description: string;
  defaultState: EntitlementState;
}

export interface TenantFeatureEntitlement {
  entitlementId: string;
  tenantId: string;
  flagKey: string;
  state: EntitlementState;
  brandId?: string | null;
  workspaceId?: string | null;
  config?: Record<string, unknown>;
  isActive: boolean;
  updatedAt?: string;
}

export interface FeatureResolutionQuery {
  tenantId: string;
  flagKey: string;
  brandId?: string | null;
  workspaceId?: string | null;
  allowTrial?: boolean;
}

export interface ApprovalPolicy {
  policyId: string;
  tenantId: string;
  scopeType: Exclude<ScopeType, 'platform'>;
  scopeRef?: string | null;
  actionKey: string;
  makerCheckerRequired: boolean;
  minApprovers: number;
  approvalMode: ApprovalMode;
  maxAmount?: number | null;
  maxDeltaPercent?: number | null;
  policy?: Record<string, unknown>;
  isActive: boolean;
}

export interface ApprovalRequestContext {
  tenantId: string;
  actionKey: string;
  scopeType: Exclude<ScopeType, 'platform'>;
  scopeRef?: string | null;
  actorUserId: string;
  amount?: number | null;
  deltaPercent?: number | null;
}

export interface ApprovalEvaluation {
  policy: ApprovalPolicy | null;
  approvalRequired: boolean;
  reasons: string[];
}

export interface RoleDefinition {
  roleKey: string;
  roleName: string;
  roleScope: ScopeType;
  permissions: PermissionKey[];
  systemRole: boolean;
}

export interface TenantMembership {
  membershipId: string;
  tenantId: string;
  userId: string;
  roleKey: string;
  permissions: PermissionKey[];
  status: 'invited' | 'active' | 'suspended' | 'revoked';
  brandId?: string | null;
  workspaceId?: string | null;
  authorityLimits?: Record<string, number>;
}

export interface TenantActionRequest {
  tenantId: string;
  requiredPermission: PermissionKey;
  featureState?: EntitlementState;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason:
    | 'ok'
    | 'cross_tenant'
    | 'membership_inactive'
    | 'permission_denied'
    | 'feature_disabled';
}

export interface AiProviderDefinition {
  providerKey: string;
  providerType: AiProviderType;
  displayName: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface AiTaskRoute {
  routeId: string;
  taskKey: string;
  primaryProviderKey: string;
  fallbackProviderKey?: string | null;
  maxCostUsd?: number | null;
  latencySloMs?: number | null;
  policy?: Record<string, unknown>;
  enabled: boolean;
}

export interface AiRouteRequest {
  taskKey: string;
  estimatedCostUsd?: number | null;
  allowFallback?: boolean;
}

export interface AiRouteSelection {
  providerKey: string | null;
  routeId: string | null;
  usedFallback: boolean;
  reason:
    | 'selected'
    | 'route_not_found'
    | 'primary_disabled'
    | 'cost_limit_exceeded'
    | 'fallback_unavailable';
}