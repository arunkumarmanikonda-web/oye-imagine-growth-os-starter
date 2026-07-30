import type {
  AuthorizationResult,
  PermissionKey,
  TenantActionRequest,
  TenantMembership,
} from './control-plane-types';

function permissionMatches(
  grantedPermission: PermissionKey,
  requiredPermission: PermissionKey,
): boolean {
  if (grantedPermission === '*') {
    return true;
  }

  if (grantedPermission === requiredPermission) {
    return true;
  }

  if (grantedPermission.endsWith('.*')) {
    const prefix = grantedPermission.slice(0, -1);
    return requiredPermission.startsWith(prefix);
  }

  return false;
}

export function hasPermission(
  membership: TenantMembership,
  requiredPermission: PermissionKey,
): boolean {
  return membership.permissions.some((permission) =>
    permissionMatches(permission, requiredPermission),
  );
}

export function authorizeTenantAction(
  membership: TenantMembership,
  request: TenantActionRequest,
): AuthorizationResult {
  if (membership.tenantId !== request.tenantId) {
    return {
      allowed: false,
      reason: 'cross_tenant',
    };
  }

  if (membership.status !== 'active') {
    return {
      allowed: false,
      reason: 'membership_inactive',
    };
  }

  if (
    request.featureState &&
    request.featureState !== 'enabled' &&
    request.featureState !== 'trial'
  ) {
    return {
      allowed: false,
      reason: 'feature_disabled',
    };
  }

  if (!hasPermission(membership, request.requiredPermission)) {
    return {
      allowed: false,
      reason: 'permission_denied',
    };
  }

  return {
    allowed: true,
    reason: 'ok',
  };
}