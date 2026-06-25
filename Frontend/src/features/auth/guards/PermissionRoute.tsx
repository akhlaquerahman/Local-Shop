import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PermissionKey } from '../permissions/permissions';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission 
} from '@/lib/permissionResolver';
import { auditService } from '@/services/audit/audit.service';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission?: PermissionKey;
  allPermissions?: PermissionKey[];
  anyPermissions?: PermissionKey[];
  fallbackPath?: string;
}

/**
 * Route guard checking specific permission keys from the RBAC registry.
 * Redirects to `/unauthorized` or logs security audit logs on failure.
 */
export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  permission,
  allPermissions,
  anyPermissions,
  fallbackPath = '/unauthorized',
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  let isAuthorized = true;

  // Explicit bypass for SELLER_OWNER
  if (user.accountType === 'SELLER_OWNER') {
    return <>{children}</>;
  }

  if (permission && !hasPermission(user, permission)) {
    isAuthorized = false;
  }

  if (allPermissions && !hasAllPermissions(user, allPermissions)) {
    isAuthorized = false;
  }

  if (anyPermissions && !hasAnyPermission(user, anyPermissions)) {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    console.warn(`[PermissionGuard] Access Denied for User: ${user.email} (Role: ${role})`);
    
    // Log the permission denial
    auditService.logSecurityEvent('PERMISSION_DENIED', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, {
      attemptedPermission: permission,
      attemptedAllPermissions: allPermissions,
      attemptedAnyPermissions: anyPermissions,
    });

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
