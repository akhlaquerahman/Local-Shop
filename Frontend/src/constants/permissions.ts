/**
 * RBAC Permission Constants Registry
 */
export const PERMISSIONS = {
  // Products
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_EDIT: 'PRODUCT_EDIT',
  PRODUCT_DELETE: 'PRODUCT_DELETE',

  // Orders
  ORDER_VIEW: 'ORDER_VIEW',
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_CANCEL: 'ORDER_CANCEL',
  ORDER_ASSIGN: 'ORDER_ASSIGN',

  // Shops
  SHOP_VIEW: 'SHOP_VIEW',
  SHOP_MANAGE: 'SHOP_MANAGE',
  SHOP_CREATE: 'SHOP_CREATE',

  // Financials & Payouts
  FINANCIAL_VIEW: 'FINANCIAL_VIEW',
  PAYOUT_APPROVE: 'PAYOUT_APPROVE',
  COMMISSION_EDIT: 'COMMISSION_EDIT',

  // User Management
  USER_VIEW: 'USER_VIEW',
  USER_MANAGE: 'USER_MANAGE',

  // System & Support
  ANALYTICS_VIEW: 'ANALYTICS_VIEW',
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  SUPPORT_CHAT_VIEW: 'SUPPORT_CHAT_VIEW',
  SUPPORT_CHAT_REPLY: 'SUPPORT_CHAT_REPLY',
  AUDIT_LOG_VIEW: 'AUDIT_LOG_VIEW',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export type UserRole = 
  | 'customer'
  | 'seller'
  | 'rider'
  | 'admin'
  | 'sub_admin'
  | 'support_agent';

/**
 * Role to Permissions Matrix mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_CANCEL,
    PERMISSIONS.SHOP_VIEW,
  ],
  rider: [
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_ASSIGN,
    PERMISSIONS.ORDER_UPDATE,
  ],
  seller: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.SHOP_VIEW,
    PERMISSIONS.SHOP_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUPPORT_CHAT_VIEW,
    PERMISSIONS.SUPPORT_CHAT_REPLY,
  ],
  admin: Object.values(PERMISSIONS) as Permission[],
  sub_admin: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.SHOP_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_LOG_VIEW,
  ],
  support_agent: [
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.SUPPORT_CHAT_VIEW,
    PERMISSIONS.SUPPORT_CHAT_REPLY,
  ],
};

/**
 * Checks if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

/**
 * Checks if a role has all specified permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((p) => hasPermission(role, p));
};

/**
 * Checks if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((p) => hasPermission(role, p));
};
