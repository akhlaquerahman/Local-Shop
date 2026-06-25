import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '../permissions/roles';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Helper to resolve the home dashboard path based on a user role
 */
export const getDashboardRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'seller':
    case 'seller_staff':
      return '/seller';
    case 'rider':
      return '/rider';
    case 'admin':
    case 'sub_admin':
    case 'support_agent':
    case 'finance_admin':
    case 'catalog_manager':
    case 'city_manager':
      return '/admin';
    case 'customer':
    default:
      return '/app';
  }
};

/**
 * Route guard that ensures only non-authenticated users (guests) can access.
 * Redirects logged-in users to their respective dashboards based on role.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRedirectPath(user.role)} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
