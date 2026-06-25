import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/constants/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Reusable component-level Guard that conditionally renders content
 * depending on the user's role profile.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  fallback = null,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
