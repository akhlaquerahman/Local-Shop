import { PermissionKey } from '@/features/auth/permissions/permissions';
import { UserRole } from '@/features/auth/permissions/roles';
import { FeatureFlags } from '@/config/features';

export interface NavigationItem {
  label: string;
  path: string;
  icon: string; // References Lucide React icon component name strings
  permission?: PermissionKey;
  allowedRoles?: UserRole[];
  feature?: keyof FeatureFlags;
  section?: string;
}

export const CUSTOMER_NAVIGATION: NavigationItem[] = [
  // PRIMARY
  { label: 'Home', path: '/app', icon: 'Home', section: 'PRIMARY' },
  { label: 'Categories', path: '/app/categories', icon: 'Grid', section: 'PRIMARY' },
  { label: 'Local Shops', path: '/app/shops', icon: 'Store', permission: 'shops.view', section: 'PRIMARY' },
  { label: 'Search', path: '/app/search', icon: 'Search', section: 'PRIMARY' },

  // SHOPPING
  { label: 'Wishlist', path: '/app/wishlist', icon: 'Heart', section: 'SHOPPING' },
  { label: 'Shopping Cart', path: '/app/cart', icon: 'ShoppingCart', section: 'SHOPPING' },
  { label: 'My Orders', path: '/app/orders', icon: 'ShoppingBag', permission: 'orders.view', section: 'SHOPPING' },
  { label: 'Returns & Cancellations', path: '/app/orders/returns', icon: 'ArrowRightLeft', permission: 'orders.view', section: 'SHOPPING' },

  // REWARDS
  { label: 'Wallet', path: '/app/wallet', icon: 'Wallet', section: 'REWARDS' },
  { label: 'Coupons', path: '/app/coupons', icon: 'Ticket', section: 'REWARDS' },
  { label: 'Referral Program', path: '/app/referral', icon: 'Gift', section: 'REWARDS' },

  // ACCOUNT
  { label: 'Profile', path: '/app/profile', icon: 'User', section: 'ACCOUNT' },
  { label: 'Saved Addresses', path: '/app/addresses', icon: 'MapPin', section: 'ACCOUNT' },
  { label: 'Reviews & Ratings', path: '/app/reviews', icon: 'Star', section: 'ACCOUNT' },
  { label: 'Payment Methods', path: '/app/payments', icon: 'CreditCard', section: 'ACCOUNT' },
  { label: 'Security Settings', path: '/app/security', icon: 'Shield', section: 'ACCOUNT' },
  { label: 'Activity Log', path: '/app/activity', icon: 'History', section: 'ACCOUNT' },

  // SUPPORT
  { label: 'Notifications', path: '/app/notifications', icon: 'Bell', section: 'SUPPORT' },
  { label: 'Support Tickets', path: '/app/support', icon: 'HelpCircle', section: 'SUPPORT' },

  // SYSTEM
  { label: 'Settings', path: '/app/settings', icon: 'Settings', section: 'SYSTEM' },
];

export const SELLER_NAVIGATION: NavigationItem[] = [
  // Dashboard
  { label: 'Dashboard Overview', path: '/seller', icon: 'LayoutDashboard', section: 'DASHBOARD' },

  // Catalog
  { label: 'Products', path: '/seller/products', icon: 'Package', permission: 'products.view', section: 'CATALOG' },
  { label: 'Create Product', path: '/seller/products/create', icon: 'PlusSquare', permission: 'products.create', section: 'CATALOG' },
  { label: 'Bulk Upload', path: '/seller/products/bulk-upload', icon: 'UploadCloud', permission: 'products.create', section: 'CATALOG' },
  { label: 'Inventory', path: '/seller/inventory', icon: 'Layers', permission: 'inventory.view', section: 'CATALOG' },

  // Orders
  { label: 'Orders', path: '/seller/orders', icon: 'ShoppingCart', permission: 'orders.view', section: 'ORDERS' },
  { label: 'Delivery Requests', path: '/seller/orders/delivery-requests', icon: 'Truck', permission: 'orders.view', section: 'ORDERS' },
  { label: 'Delivery Partners', path: '/seller/delivery-partners', icon: 'Bike', permission: 'orders.view', section: 'ORDERS' },
  { label: 'Returns & Replacements', path: '/seller/returns', icon: 'ArrowRightLeft', permission: 'orders.view', section: 'ORDERS' },

  // Customers
  { label: 'Customers', path: '/seller/customers', icon: 'Users', permission: 'users.view', section: 'CUSTOMERS' },

  // Marketing
  { label: 'Coupons', path: '/seller/coupons', icon: 'Tag', permission: 'coupons.view', section: 'MARKETING' },
  { label: 'Promotions', path: '/seller/promotions', icon: 'Zap', permission: 'coupons.view', section: 'MARKETING' },
  { label: 'Marketing Tools', path: '/seller/marketing', icon: 'Megaphone', permission: 'coupons.view', section: 'MARKETING' },

  // Analytics (Moved to Dashboard Overview)
  // Removed Analytics Dashboard, Product Analytics, Customer Analytics, Revenue Summary from sidebar

  // Finance
  { label: 'Payouts', path: '/seller/payouts', icon: 'CreditCard', permission: 'payouts.view', section: 'FINANCE' },

  // Reviews
  { label: 'Reviews & Ratings', path: '/seller/reviews', icon: 'Star', permission: 'reviews.view', section: 'REVIEWS' },

  // Shop
  { label: 'Shop Settings', path: '/seller/settings', icon: 'Settings', permission: 'shops.manage', section: 'SHOP' },
  { label: 'Staff Management', path: '/seller/staff', icon: 'Users2', permission: 'shops.manage', section: 'SHOP' },
  { label: 'Role Management', path: '/seller/staff/roles', icon: 'Shield', permission: 'shops.manage', section: 'SHOP' },
  { label: 'KYC Documents', path: '/seller/kyc', icon: 'FileCheck', permission: 'shops.manage', section: 'SHOP' },

  // Communication
  { label: 'Notifications', path: '/seller/notifications', icon: 'Bell', permission: 'notifications.view', section: 'COMMUNICATION' },
  { label: 'Support', path: '/seller/support', icon: 'LifeBuoy', permission: 'support.view', section: 'COMMUNICATION' },

  // Reports
  { label: 'Reports', path: '/seller/reports', icon: 'FileText', permission: 'reports.view', section: 'REPORTS' },

  // Account
  { label: 'Profile', path: '/seller/profile', icon: 'User', section: 'ACCOUNT' },
  { label: 'Security', path: '/seller/security', icon: 'Shield', permission: 'shops.manage', section: 'ACCOUNT' },
  { label: 'Activity Logs', path: '/seller/activity-logs', icon: 'History', permission: 'shops.manage', section: 'ACCOUNT' },
];

export const RIDER_NAVIGATION: NavigationItem[] = [
  // Dashboard
  { label: 'Dashboard', path: '/rider', icon: 'LayoutDashboard', section: 'DASHBOARD' },

  // Deliveries
  { label: 'Available Deliveries', path: '/rider/deliveries/available', icon: 'Compass', permission: 'deliveries.view', section: 'DELIVERIES' },
  { label: 'My Pending Requests', path: '/rider/deliveries/requested', icon: 'Clock', permission: 'deliveries.view', section: 'DELIVERIES' },
  { label: 'Assigned Deliveries', path: '/rider/deliveries/assigned', icon: 'ClipboardList', permission: 'deliveries.view', section: 'DELIVERIES' },
  { label: 'Return Pickups', path: '/rider/return-pickups', icon: 'PackageOpen', permission: 'deliveries.view', section: 'DELIVERIES' },
  { label: 'Completed Deliveries', path: '/rider/deliveries/completed', icon: 'CheckCircle', permission: 'deliveries.view', section: 'DELIVERIES' },
  { label: 'Failed Deliveries', path: '/rider/deliveries/failed', icon: 'XCircle', permission: 'deliveries.view', section: 'DELIVERIES' },

  // Finance
  { label: 'Earnings', path: '/rider/earnings', icon: 'IndianRupee', feature: 'wallet', section: 'FINANCE' },
  { label: 'Wallet', path: '/rider/wallet', icon: 'Wallet', feature: 'wallet', section: 'FINANCE' },

  // Performance
  { label: 'Ratings & Feedback', path: '/rider/ratings', icon: 'Star', section: 'PERFORMANCE' },

  // Verification
  { label: 'Documents', path: '/rider/documents', icon: 'FileText', section: 'VERIFICATION' },
  { label: 'KYC Verification', path: '/rider/kyc', icon: 'ShieldCheck', section: 'VERIFICATION' },

  // Communication
  { label: 'Notifications', path: '/rider/notifications', icon: 'Bell', section: 'COMMUNICATION' },
  { label: 'Support', path: '/rider/support', icon: 'LifeBuoy', section: 'COMMUNICATION' },

  // Account
  { label: 'Profile', path: '/rider/profile', icon: 'User', section: 'ACCOUNT' },
  { label: 'Security', path: '/rider/security', icon: 'Shield', section: 'ACCOUNT' },
  { label: 'Settings', path: '/rider/settings', icon: 'Settings', section: 'ACCOUNT' },
  { label: 'Activity Logs', path: '/rider/activity-logs', icon: 'History', section: 'ACCOUNT' },
];

export const ADMIN_NAVIGATION: NavigationItem[] = [
  // Dashboard
  { label: 'Platform Dashboard', path: '/admin', icon: 'LayoutDashboard', section: 'DASHBOARD' },

  // User Management
  { label: 'Sellers', path: '/admin/users/sellers', icon: 'Store', permission: 'users.view', section: 'USER MANAGEMENT' },
  { label: 'Customers', path: '/admin/users/customers', icon: 'Users', permission: 'users.view', section: 'USER MANAGEMENT' },
  { label: 'Delivery Partners', path: '/admin/users/delivery-partners', icon: 'Bike', permission: 'users.view', section: 'USER MANAGEMENT' },

  // Marketplace Setup
  { label: 'Cities', path: '/admin/cities', icon: 'Map', permission: 'settings.manage', section: 'MARKETPLACE SETUP' },
  { label: 'Zones', path: '/admin/cities/all/zones', icon: 'MapPin', permission: 'settings.manage', section: 'MARKETPLACE SETUP' },
  { label: 'Categories', path: '/admin/categories', icon: 'List', permission: 'settings.manage', section: 'MARKETPLACE SETUP' },
  { label: 'Brands', path: '/admin/brands', icon: 'Award', permission: 'settings.manage', section: 'MARKETPLACE SETUP' },

  // Catalog
  { label: 'Products', path: '/admin/products', icon: 'Package', permission: 'products.view', section: 'CATALOG' },
  { label: 'Inventory', path: '/admin/inventory', icon: 'Layers', permission: 'inventory.view', section: 'CATALOG' },

  // Orders
  { label: 'Orders', path: '/admin/orders', icon: 'ShoppingCart', permission: 'orders.view', section: 'ORDERS & FULFILLMENT' },
  { label: 'Returns & Refunds', path: '/admin/returns', icon: 'ArrowRightLeft', permission: 'orders.view', section: 'ORDERS & FULFILLMENT' },

  // Finance
  { label: 'Payments', path: '/admin/payments', icon: 'CreditCard', permission: 'payouts.manage', section: 'FINANCE' },
  { label: 'Refunds', path: '/admin/refunds', icon: 'RefreshCcw', permission: 'payouts.manage', section: 'FINANCE' },
  { label: 'Payouts', path: '/admin/payouts', icon: 'Banknote', permission: 'payouts.manage', section: 'FINANCE' },
  { label: 'Commissions', path: '/admin/commissions', icon: 'Percent', permission: 'payouts.manage', section: 'FINANCE' },
  { label: 'Wallets', path: '/admin/wallets', icon: 'Wallet', permission: 'payouts.manage', section: 'FINANCE' },

  // Reputation
  { label: 'Reviews', path: '/admin/reviews', icon: 'MessageSquare', permission: 'reviews.view', section: 'REPUTATION' },
  // Operations
  { label: 'Disputes', path: '/admin/disputes', icon: 'AlertOctagon', permission: 'support.view', section: 'OPERATIONS' },
  { label: 'Support Tickets', path: '/admin/support', icon: 'LifeBuoy', permission: 'support.view', section: 'OPERATIONS' },
  { label: 'Notifications', path: '/admin/notifications', icon: 'Bell', permission: 'notifications.view', section: 'OPERATIONS' },
  { label: 'Announcements', path: '/admin/announcements', icon: 'Mic', permission: 'notifications.view', section: 'OPERATIONS' },

  // Marketing
  { label: 'Banners', path: '/admin/banners', icon: 'Image', permission: 'settings.manage', section: 'MARKETING' },
  { label: 'Advertisements', path: '/admin/advertisements', icon: 'MonitorPlay', permission: 'settings.manage', section: 'MARKETING' },
  { label: 'Coupons', path: '/admin/coupons', icon: 'Ticket', permission: 'coupons.view', section: 'MARKETING' },

  // CMS
  { label: 'Pages', path: '/admin/cms/pages', icon: 'FileText', permission: 'settings.manage', section: 'CMS' },


  // Team & Access
  { label: 'Agent Management', path: '/admin/agents', icon: 'Users2', permission: 'settings.manage', section: 'TEAM & ACCESS' },
  { label: 'Agent Roles', path: '/admin/agents/roles', icon: 'Shield', permission: 'settings.manage', section: 'TEAM & ACCESS' },

  // Monitoring
  { label: 'System Logs', path: '/admin/system-logs', icon: 'Terminal', permission: 'audit.view', section: 'MONITORING' },
  { label: 'Fraud Monitoring', path: '/admin/fraud', icon: 'AlertTriangle', permission: 'audit.view', section: 'MONITORING' },

  // Platform
  { label: 'Configuration Center', path: '/admin/configuration', icon: 'Settings2', permission: 'settings.manage', section: 'PLATFORM' },
  { label: 'AI Control Panel', path: '/admin/ai/knowledge', icon: 'BrainCircuit', permission: 'settings.manage', section: 'PLATFORM' },
  { label: 'AI Workforce Center', path: '/admin/ai/workforce', icon: 'Bot', permission: 'settings.manage', section: 'PLATFORM' },
  { label: 'AI Audit & Governance', path: '/admin/ai/audit', icon: 'Database', permission: 'settings.manage', section: 'PLATFORM' },
  { label: 'Database Explorer', path: '/admin/database-explorer', icon: 'Database', permission: 'settings.manage', section: 'PLATFORM' },

  // Insights
  { label: 'Reports', path: '/admin/reports', icon: 'FileBarChart', permission: 'analytics.view', section: 'INSIGHTS' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'PieChart', permission: 'analytics.view', section: 'INSIGHTS' },

  // Settings
  { label: 'My Profile', path: '/admin/profile', icon: 'User', permission: 'settings.manage', section: 'SETTINGS' },
];
