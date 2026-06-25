import { PermissionKey, PERMISSIONS } from './permissions';

export interface ModuleDefinition {
  id: string;
  name: string;
  permissions: PermissionKey[];
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'users',
    name: 'User Management',
    permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_MANAGE],
  },
  {
    id: 'shops',
    name: 'Shops Directory',
    permissions: [PERMISSIONS.SHOPS_VIEW, PERMISSIONS.SHOPS_CREATE, PERMISSIONS.SHOPS_MANAGE],
  },
  {
    id: 'products',
    name: 'Products Catalog',
    permissions: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT, PERMISSIONS.PRODUCTS_DELETE],
  },
  {
    id: 'inventory',
    name: 'Inventory Controller',
    permissions: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE],
  },
  {
    id: 'orders',
    name: 'Order Queue',
    permissions: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_UPDATE, PERMISSIONS.ORDERS_CANCEL],
  },
  {
    id: 'deliveries',
    name: 'Rider Deliveries',
    permissions: [PERMISSIONS.DELIVERIES_VIEW, PERMISSIONS.DELIVERIES_UPDATE, PERMISSIONS.DELIVERIES_PROOF],
  },
  {
    id: 'payouts',
    name: 'Settlements & Payouts',
    permissions: [PERMISSIONS.PAYOUTS_VIEW, PERMISSIONS.PAYOUTS_MANAGE],
  },
  {
    id: 'wallet',
    name: 'Platform Wallets',
    permissions: [PERMISSIONS.WALLET_VIEW, PERMISSIONS.WALLET_MANAGE],
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    permissions: [PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_VIEW],
  },
  {
    id: 'audit',
    name: 'Audit Logs Ledger',
    permissions: [PERMISSIONS.AUDIT_VIEW],
  },
  {
    id: 'system',
    name: 'System Preferences',
    permissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE],
  },
];
