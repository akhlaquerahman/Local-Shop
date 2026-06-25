import { PermissionKey, PERMISSIONS } from './permissions';

export type StaffRole = 'STORE_MANAGER' | 'INVENTORY_MANAGER' | 'ORDER_MANAGER' | 'SUPPORT_AGENT' | 'CUSTOM';

export interface StaffRoleConfig {
  name: string;
  defaultRoute: string;
  permissions: PermissionKey[] | ['*'];
}

export const STAFF_ROLES: Record<StaffRole, StaffRoleConfig> = {
  STORE_MANAGER: {
    name: 'Store Manager',
    defaultRoute: '/seller',
    permissions: [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_MANAGE,
      PERMISSIONS.ORDERS_VIEW,
      // Note: mapping 'orders.manage' to existing ORDERS_UPDATE and ORDERS_CANCEL
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.ORDERS_CANCEL,
      // Using existing deliveries permissions for Delivery Requests / Delivery Partners
      PERMISSIONS.DELIVERIES_VIEW,
      PERMISSIONS.DELIVERIES_UPDATE,
      PERMISSIONS.DELIVERIES_PROOF,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.ANALYTICS_VIEW,
      // using settings.view for 'profile.view' since 'profile.view' is not in PERMISSIONS, or just relying on Dashboard and Profile being permission-less
    ],
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    defaultRoute: '/seller/products',
    permissions: [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_MANAGE,
    ],
  },
  ORDER_MANAGER: {
    name: 'Order Manager',
    defaultRoute: '/seller/orders',
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.ORDERS_CANCEL,
      PERMISSIONS.DELIVERIES_VIEW,
      PERMISSIONS.DELIVERIES_UPDATE,
      PERMISSIONS.DELIVERIES_PROOF,
      PERMISSIONS.USERS_VIEW,
    ],
  },
  SUPPORT_AGENT: {
    name: 'Support Agent',
    defaultRoute: '/seller/support',
    permissions: [
      PERMISSIONS.ORDERS_VIEW, // View Only
      PERMISSIONS.REVIEWS_VIEW,
      PERMISSIONS.REVIEWS_REPLY,
      PERMISSIONS.SUPPORT_VIEW,
      PERMISSIONS.SUPPORT_REPLY,
    ],
  },
  CUSTOM: {
    name: 'Custom',
    defaultRoute: '/seller',
    permissions: [],
  }
};
