export interface FeatureFlags {
  chat: boolean;
  wallet: boolean;
  loyalty: boolean;
  ads: boolean;
  subscriptions: boolean;
  multiVendorCart: boolean;
  returns: boolean;
  gstInvoices: boolean;
}

export const featureFlags: FeatureFlags = {
  chat: true,
  wallet: true,
  loyalty: true,
  ads: false, // Under dev
  subscriptions: false, // Planned
  multiVendorCart: false, // Strict hyperlocal checks enabled
  returns: true,
  gstInvoices: true,
};

/**
 * Enterprise Feature Flag evaluator.
 * Admins get override checks, and environments override values.
 */
export const isFeatureEnabled = (
  feature: keyof FeatureFlags,
  userRole?: string
): boolean => {
  // Super Admin overrides flags for debugging purposes
  if (userRole === 'admin') {
    return true;
  }
  
  // Environment override check (e.g. disable chat in testing environments)
  const envKey = `VITE_FEATURE_${String(feature).toUpperCase()}`;
  const envVal = import.meta.env[envKey];
  if (envVal !== undefined) {
    return envVal === 'true';
  }

  return featureFlags[feature] ?? false;
};
