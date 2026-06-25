import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '../permissions/roles';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Route guard checking if the authenticated user possesses one of the allowed roles.
 * Redirects to `/unauthorized` on failure.
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasRoleAccess = allowedRoles.includes(user.role);

  if (!hasRoleAccess) {
    console.warn(`[RoleGuard] Access Denied: User role "${user.role}" is not in list of allowed roles:`, allowedRoles);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
