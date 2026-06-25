import React from 'react';
import { FeatureFlags, isFeatureEnabled } from '@/config/features';

interface FeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureFlag: keyof FeatureFlags;
}

/**
 * Reusable component-level Guard that conditionally renders content
 * depending on whether a feature flag is enabled in config.
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  fallback = null,
  featureFlag,
}) => {
  const isEnabled = isFeatureEnabled(featureFlag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureGuard;
