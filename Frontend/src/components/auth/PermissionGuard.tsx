import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  Permission, 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission 
} from '@/constants/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission?: Permission;
  allPermissions?: Permission[];
  anyPermissions?: Permission[];
}

/**
 * Enterprise component-level Guard that conditionally renders content
 * depending on the user's role permissions.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null,
  permission,
  allPermissions,
  anyPermissions,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const role = user.role;

  if (permission && !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  if (allPermissions && !hasAllPermissions(role, allPermissions)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && !hasAnyPermission(role, anyPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
