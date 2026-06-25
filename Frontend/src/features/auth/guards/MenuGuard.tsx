import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { PermissionKey } from '../permissions/permissions';
import { UserRole } from '../permissions/roles';
import { FeatureFlags, isFeatureEnabled } from '@/config/features';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission 
} from '@/lib/permissionResolver';

interface MenuGuardProps {
  children: React.ReactNode;
  permission?: PermissionKey;
  allPermissions?: PermissionKey[];
  anyPermissions?: PermissionKey[];
  allowedRoles?: UserRole[];
  feature?: keyof FeatureFlags;
}

/**
 * Component-level visibility guard for navigation sidebar menus, buttons, actions.
 * Renders `null` if the user does not meet the specified access rules.
 */
export const MenuGuard: React.FC<MenuGuardProps> = ({
  children,
  permission,
  allPermissions,
  anyPermissions,
  allowedRoles,
  feature,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  // If a feature flag is required and disabled, hide the component
  if (feature && !isFeatureEnabled(feature, user?.role)) {
    return null;
  }

  // If a role or permission is required but user is not logged in, hide
  if ((permission || allPermissions || anyPermissions || allowedRoles) && !isAuthenticated) {
    return null;
  }

  const role = user?.role;

  if (role) {
    if (allowedRoles && !allowedRoles.includes(role)) {
      return null;
    }

    if (permission && !hasPermission(role, permission)) {
      return null;
    }

    if (allPermissions && !hasAllPermissions(role, allPermissions)) {
      return null;
    }

    if (anyPermissions && !hasAnyPermission(role, anyPermissions)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default MenuGuard;
