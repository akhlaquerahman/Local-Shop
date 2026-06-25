import { PermissionKey, ROLE_PERMISSIONS, UserRole } from '@/features/auth/permissions/roles';
import { isFeatureEnabled, FeatureFlags } from '@/config/features';

/**
 * Checks if a user has a specific permission key.
 */
export const hasPermission = (user: any, permission: PermissionKey): boolean => {
  if (!user) return false;

  // Handle Staff/Agents explicitly using their injected `permissions` or `effectivePermissions` array
  if (user.isStaff || user.isAgent) {
    let perms = user.effectivePermissions || user.permissions || [];
    if (perms.includes('*')) return true;
    return perms.includes(permission) || false;
  }

  // Handle regular roles mapping
  return ROLE_PERMISSIONS[user.role as UserRole]?.includes(permission) || false;
};

/**
 * Checks if a user has all specified permissions.
 */
export const hasAllPermissions = (user: any, permissions: PermissionKey[]): boolean => {
  return permissions.every((p) => hasPermission(user, p));
};

/**
 * Checks if a user has at least one of the specified permissions.
 */
export const hasAnyPermission = (user: any, permissions: PermissionKey[]): boolean => {
  return permissions.some((p) => hasPermission(user, p));
};

/**
 * Checks if a user's role is in the list of allowed roles.
 */
export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

/**
 * Wrapper checking if a feature flag is enabled for the current user session role.
 */
export const hasFeature = (feature: keyof FeatureFlags, userRole?: UserRole): boolean => {
  return isFeatureEnabled(feature, userRole);
};
