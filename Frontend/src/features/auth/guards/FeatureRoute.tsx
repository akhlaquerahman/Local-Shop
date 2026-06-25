import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FeatureFlags, isFeatureEnabled } from '@/config/features';

interface FeatureRouteProps {
  children: React.ReactNode;
  feature: keyof FeatureFlags;
  fallbackPath?: string;
}

/**
 * Route guard that checks if a global feature flag is enabled.
 * If the user is an admin, the flag is bypassed (always enabled).
 * Redirects to `/unauthorized` or `/maintenance` on failure.
 */
export const FeatureRoute: React.FC<FeatureRouteProps> = ({
  children,
  feature,
  fallbackPath = '/unauthorized',
}) => {
  const { user } = useAuthStore();
  
  const enabled = isFeatureEnabled(feature, user?.role);

  if (!enabled) {
    console.warn(`[FeatureGuard] Access Blocked: Feature flag "${feature}" is disabled.`);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default FeatureRoute;
