import { PermissionKey } from '@/features/auth/permissions/permissions';
import { UserRole } from '@/features/auth/permissions/roles';
import { FeatureFlags } from '@/config/features';

export interface RouteMeta {
  id: string;
  title: string;
  icon: string; // References Lucide React icon component name strings
  breadcrumb: boolean;
  module?: string;
  permission?: PermissionKey;
  allowedRoles?: UserRole[];
  featureFlag?: keyof FeatureFlags;
}

export const ROUTE_META_REGISTRY: Record<string, RouteMeta> = {
  // Customer Routes
  '/app': {
    id: 'customer_dashboard',
    title: 'Marketplace Feed',
    icon: 'Store',
    breadcrumb: true,
    module: 'products',
    permission: 'products.view',
  },
  '/app/shops': {
    id: 'customer_shops',
    title: 'Local Shops',
    icon: 'MapPin',
    breadcrumb: true,
    module: 'shops',
    permission: 'shops.view',
  },
  '/app/orders': {
    id: 'customer_orders',
    title: 'My Orders',
    icon: 'ShoppingBag',
    breadcrumb: true,
    module: 'orders',
    permission: 'orders.view',
  },
  '/app/profile': {
    id: 'customer_profile',
    title: 'My Profile',
    icon: 'User',
    breadcrumb: true,
  },
  '/app/cart': {
    id: 'customer_cart',
    title: 'Shopping Cart',
    icon: 'ShoppingCart',
    breadcrumb: true,
  },

  // Seller Routes
  '/seller': {
    id: 'seller_dashboard',
    title: 'Merchant Dashboard',
    icon: 'LayoutDashboard',
    breadcrumb: true,
    allowedRoles: ['seller', 'seller_staff', 'admin'],
  },
  '/seller/products': {
    id: 'seller_products',
    title: 'Manage Catalog',
    icon: 'Package',
    breadcrumb: true,
    module: 'products',
    permission: 'products.view',
    allowedRoles: ['seller', 'seller_staff', 'admin'],
  },
  '/seller/orders': {
    id: 'seller_orders',
    title: 'Fulfillments Queue',
    icon: 'ShoppingBag',
    breadcrumb: true,
    module: 'orders',
    permission: 'orders.view',
    allowedRoles: ['seller', 'seller_staff', 'admin'],
  },
  '/seller/analytics': {
    id: 'seller_analytics',
    title: 'Sales Performance',
    icon: 'BarChart3',
    breadcrumb: true,
    module: 'analytics',
    permission: 'analytics.view',
    allowedRoles: ['seller', 'admin'],
  },
  '/seller/kyc': {
    id: 'seller_kyc',
    title: 'Merchant KYC Docs',
    icon: 'FileCheck',
    breadcrumb: true,
    allowedRoles: ['seller'],
  },
  '/seller/settings': {
    id: 'seller_settings',
    title: 'Branch Settings',
    icon: 'Settings',
    breadcrumb: true,
    permission: 'shops.manage',
    allowedRoles: ['seller', 'admin'],
  },

  // Rider Routes
  '/rider': {
    id: 'rider_dashboard',
    title: 'Delivery Panel',
    icon: 'Compass',
    breadcrumb: true,
    permission: 'deliveries.view',
    allowedRoles: ['rider', 'admin'],
  },
  '/rider/jobs': {
    id: 'rider_jobs',
    title: 'Delivery Jobs Ledger',
    icon: 'ClipboardList',
    breadcrumb: true,
    permission: 'deliveries.view',
    allowedRoles: ['rider', 'admin'],
  },
  '/rider/earnings': {
    id: 'rider_earnings',
    title: 'E-Earnings History',
    icon: 'IndianRupee',
    breadcrumb: true,
    allowedRoles: ['rider'],
    featureFlag: 'wallet',
  },
  '/rider/profile': {
    id: 'rider_profile',
    title: 'Rider Bio Registry',
    icon: 'UserCheck',
    breadcrumb: true,
    allowedRoles: ['rider'],
  },

  // Admin Routes
  '/admin': {
    id: 'admin_dashboard',
    title: 'Admin Command Board',
    icon: 'ShieldAlert',
    breadcrumb: true,
    allowedRoles: ['admin', 'sub_admin', 'support_agent', 'finance_admin', 'catalog_manager', 'city_manager'],
  },
  '/admin/users': {
    id: 'admin_users',
    title: 'Platform User Registry',
    icon: 'Users',
    breadcrumb: true,
    permission: 'users.view',
    allowedRoles: ['admin', 'sub_admin'],
  },
  '/admin/shops': {
    id: 'admin_shops',
    title: 'Merchant Operations',
    icon: 'Warehouse',
    breadcrumb: true,
    permission: 'shops.view',
    allowedRoles: ['admin', 'sub_admin', 'city_manager'],
  },
  '/admin/payouts': {
    id: 'admin_payouts',
    title: 'Payout Disbursals',
    icon: 'IndianRupee',
    breadcrumb: true,
    permission: 'payouts.manage',
    allowedRoles: ['admin', 'finance_admin'],
  },
  '/admin/commissions': {
    id: 'admin_commissions',
    title: 'Commission Margins',
    icon: 'Percent',
    breadcrumb: true,
    permission: 'payouts.manage',
    allowedRoles: ['admin', 'finance_admin'],
  },
  '/admin/settings': {
    id: 'admin_settings',
    title: 'System Preferences',
    icon: 'Sliders',
    breadcrumb: true,
    permission: 'settings.manage',
    allowedRoles: ['admin'],
  },
  '/admin/audit-logs': {
    id: 'admin_audit',
    title: 'Security Ledgers',
    icon: 'History',
    breadcrumb: true,
    permission: 'audit.view',
    allowedRoles: ['admin', 'sub_admin'],
  },
};

export const getRouteMeta = (path: string): RouteMeta | null => {
  return ROUTE_META_REGISTRY[path] || null;
};
