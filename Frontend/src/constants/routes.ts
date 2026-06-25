/**
 * Centralized Route Paths Registry
 */
export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404',
  MAINTENANCE: '/maintenance',
  OFFLINE: '/offline',

  // Customer Panel
  CUSTOMER: {
    DASHBOARD: '/app',
    SHOPS: '/app/shops',
    ORDERS: '/app/orders',
    PROFILE: '/app/profile',
    CART: '/app/cart',
  },

  // Seller Panel
  SELLER: {
    DASHBOARD: '/seller',
    PRODUCTS: '/seller/products',
    ORDERS: '/seller/orders',
    ANALYTICS: '/seller/analytics',
    SETTINGS: '/seller/settings',
    KYC: '/seller/kyc',
  },

  // Rider Panel
  RIDER: {
    DASHBOARD: '/rider',
    JOBS: '/rider/jobs',
    EARNINGS: '/rider/earnings',
    PROFILE: '/rider/profile',
  },

  // Admin Portal
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    SHOPS: '/admin/shops',
    PAYOUTS: '/admin/payouts',
    COMMISSIONS: '/admin/commissions',
    SETTINGS: '/admin/settings',
    AUDIT_LOGS: '/admin/audit-logs',
  },
} as const;
