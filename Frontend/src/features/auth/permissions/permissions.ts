/**
 * Fine-grained access control permission keys
 */
export const PERMISSIONS = {
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  USERS_MANAGE: 'users.manage',

  SHOPS_VIEW: 'shops.view',
  SHOPS_CREATE: 'shops.create',
  SHOPS_MANAGE: 'shops.manage',

  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',

  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',

  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_CANCEL: 'orders.cancel',

  DELIVERIES_VIEW: 'deliveries.view',
  DELIVERIES_UPDATE: 'deliveries.update',
  DELIVERIES_PROOF: 'deliveries.proof',

  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',

  PAYOUTS_VIEW: 'payouts.view',
  PAYOUTS_MANAGE: 'payouts.manage',

  WALLET_VIEW: 'wallet.view',
  WALLET_MANAGE: 'wallet.manage',

  REVIEWS_VIEW: 'reviews.view',
  REVIEWS_REPLY: 'reviews.reply',

  COUPONS_VIEW: 'coupons.view',
  COUPONS_MANAGE: 'coupons.manage',

  ANALYTICS_VIEW: 'analytics.view',
  REPORTS_VIEW: 'reports.view',

  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_SEND: 'notifications.send',

  SUPPORT_VIEW: 'support.view',
  SUPPORT_REPLY: 'support.reply',

  CMS_VIEW: 'cms.view',
  CMS_MANAGE: 'cms.manage',

  CITIES_VIEW: 'cities.view',
  CITIES_MANAGE: 'cities.manage',

  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_MANAGE: 'categories.manage',

  BRANDS_VIEW: 'brands.view',
  BRANDS_MANAGE: 'brands.manage',

  FRAUD_VIEW: 'fraud.view',
  FRAUD_MANAGE: 'fraud.manage',

  AUDIT_VIEW: 'audit.view',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];
