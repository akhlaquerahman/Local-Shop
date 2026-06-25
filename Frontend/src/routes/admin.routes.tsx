import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PermissionRoute from '@/features/auth/guards/PermissionRoute';
import { Skeleton } from '@/components/ui/Skeleton';

const LoadingFallback = () => (
  <div className="p-6 space-y-4 max-w-7xl mx-auto w-full text-left">
    <Skeleton className="h-10 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-72" />
  </div>
);

// Fallback component while physical pages are being generated
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-surface border border-border rounded-xl">
    <h2 className="text-xl font-bold">{title}</h2>
    <p className="text-sm text-text-secondary mt-2">This module is under construction.</p>
  </div>
);

// Dashboard
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard'));

// User Management
const SellersPage = lazy(() => import('@/features/admin/pages/SellersPage'));
const CustomersPage = lazy(() => import('@/features/admin/pages/CustomersPage'));
const DeliveryPartnersPage = lazy(() => import('@/features/admin/pages/DeliveryPartnersPage'));
const UserDetailPage = lazy(() => import('@/features/admin/pages/UserDetailPage'));

// Team & Access
const AdminAgentsPage = lazy(() => import('@/features/admin/pages/AdminAgentsPage'));
const AdminRolesPage = lazy(() => import('@/features/admin/pages/AdminRolesPage'));

// Compliance / KYC
const AdminKycCenter = lazy(() => import('@/features/admin/kyc/AdminKycCenter'));

// Marketplace Setup
const CitiesPage = lazy(() => import('@/features/admin/pages/CitiesPage'));
const ZonesPage = lazy(() => import('@/features/admin/pages/ZonesPage'));
const CategoriesPage = lazy(() => import('@/features/admin/pages/CategoriesPage'));
const BrandsPage = lazy(() => import('@/features/admin/pages/BrandsPage'));

// Catalog
const AdminProductsPage = lazy(() => import('@/features/admin/pages/AdminProductsPage'));
const ProductDetailPage = lazy(() => import('@/features/admin/pages/ProductDetailPage'));
const InventoryOverviewPage = lazy(() => import('@/features/admin/pages/InventoryOverviewPage'));

// Orders
const AdminOrdersPage = lazy(() => import('@/features/admin/pages/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/features/admin/pages/AdminOrderDetailPage'));
const ReturnsDashboardPage = lazy(() => import('@/features/admin/pages/ReturnsDashboardPage'));

// Finance
const PaymentsPage = lazy(() => import('@/features/admin/pages/PaymentsPage'));
const PaymentDetailPage = lazy(() => import('@/features/admin/pages/PaymentDetailPage'));
const RefundsPage = lazy(() => import('@/features/admin/pages/RefundsPage'));
const PayoutsPage = lazy(() => import('@/features/admin/pages/PayoutsPage'));
const CommissionsPage = lazy(() => import('@/features/admin/pages/CommissionsPage'));
const WalletsPage = lazy(() => import('@/features/admin/pages/WalletsPage'));

// Reputation
const AdminReviewsPage = lazy(() => import('@/features/admin/pages/AdminReviewsPage'));
const AdminRatingsPage = lazy(() => import('@/features/admin/pages/AdminRatingsPage'));

// Operations
const DisputesPage = lazy(() => import('@/features/admin/pages/DisputesPage'));
const DisputeDetailPage = lazy(() => import('@/features/admin/pages/DisputeDetailPage'));
const SupportTicketsPage = lazy(() => import('@/features/admin/pages/SupportTicketsPage'));
const SupportTicketChatPage = lazy(() => import('@/features/admin/pages/SupportTicketChatPage'));
const TicketDetailPage = lazy(() => import('@/features/admin/pages/TicketDetailPage'));
const NotificationsPage = lazy(() => import('@/features/admin/pages/NotificationsPage'));
const AnnouncementsPage = lazy(() => import('@/features/admin/pages/AnnouncementsPage'));

// Marketing
const BannersPage = lazy(() => import('@/features/admin/pages/BannersPage'));
const AdvertisementsPage = lazy(() => import('@/features/admin/pages/AdvertisementsPage'));
const CouponsPage = lazy(() => import('@/features/admin/pages/CouponsPage'));

// CMS
const CmsPagesPage = lazy(() => import('@/features/admin/pages/CmsPagesPage'));
const CmsBlogsPage = lazy(() => import('@/features/admin/pages/CmsBlogsPage'));
const CmsFaqPage = lazy(() => import('@/features/admin/pages/CmsFaqPage'));

// Templates
const EmailTemplatesPage = lazy(() => import('@/features/admin/pages/EmailTemplatesPage'));
const SmsTemplatesPage = lazy(() => import('@/features/admin/pages/SmsTemplatesPage'));
const PushTemplatesPage = lazy(() => import('@/features/admin/pages/PushTemplatesPage'));

// Access Control
const RolesPage = lazy(() => import('@/features/admin/pages/RolesPage'));
const PermissionsPage = lazy(() => import('@/features/admin/pages/PermissionsPage'));

// Monitoring
const AuditLogsPage = lazy(() => import('@/features/admin/pages/AuditLogsPage'));
const SystemLogsPage = lazy(() => import('@/features/admin/pages/SystemLogsPage'));
const FraudMonitoringPage = lazy(() => import('@/features/admin/pages/FraudMonitoringPage'));
const HealthStatusPage = lazy(() => import('@/features/admin/pages/HealthStatusPage'));

// Platform
const SettingsPage = lazy(() => import('@/features/admin/pages/SettingsPage'));
const IntegrationsPage = lazy(() => import('@/features/admin/pages/IntegrationsPage'));

// Insights
const ReportsPage = lazy(() => import('@/features/admin/pages/ReportsPage'));
const AnalyticsPage = lazy(() => import('@/features/admin/pages/AnalyticsPage'));

// Profile
const AdminProfilePage = lazy(() => import('@/features/admin/pages/AdminProfilePage'));

// Database Explorer
const DatabaseExplorerLayout = lazy(() => import('@/features/admin/database-explorer/DatabaseExplorerLayout'));
const DashboardOverview = lazy(() => import('@/features/admin/database-explorer/pages/DashboardOverview'));
const DocumentExplorer = lazy(() => import('@/features/admin/database-explorer/pages/DocumentExplorer'));

// Configuration Center
const ConfigurationLayout = lazy(() => import('@/features/admin/configuration/ConfigurationLayout').then(m => ({ default: m.ConfigurationLayout })));
const ConfigDashboard = lazy(() => import('@/features/admin/configuration/pages/ConfigDashboard'));
const SecretsVault = lazy(() => import('@/features/admin/configuration/pages/SecretsVault'));
const ApiManagement = lazy(() => import('@/features/admin/configuration/pages/ApiManagement'));

// AI Control Panel
const AiKnowledgeCenterLayout = lazy(() => import('@/features/admin/ai/AiKnowledgeCenterLayout').then(m => ({ default: m.AiKnowledgeCenterLayout })));
const KnowledgeBasePage = lazy(() => import('@/features/admin/ai/pages/KnowledgeBasePage').then(m => ({ default: m.KnowledgeBasePage })));
const AiAnalyticsPage = lazy(() => import('@/features/admin/ai/pages/AiAnalyticsPage').then(m => ({ default: m.AiAnalyticsPage })));
const WorkforceCenter = lazy(() => import('@/features/admin/ai/pages/WorkforceCenter').then(m => ({ default: m.WorkforceCenter || m.default })));
const AuditCenter = lazy(() => import('@/features/admin/ai/pages/AuditCenter').then(m => ({ default: m.AuditCenter || m.default })));
const ApprovalQueue = lazy(() => import('@/features/admin/ai/pages/ApprovalQueue').then(m => ({ default: m.ApprovalQueue || m.default })));

export const adminRoutes: RouteObject[] = [
  { path: '', element: <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense> },

  // User Management
  { path: 'users/sellers', element: <PermissionRoute permission="users.view"><Suspense fallback={<LoadingFallback />}><SellersPage /></Suspense></PermissionRoute> },
  { path: 'users/customers', element: <PermissionRoute permission="users.view"><Suspense fallback={<LoadingFallback />}><CustomersPage /></Suspense></PermissionRoute> },
  { path: 'users/delivery-partners', element: <PermissionRoute permission="users.view"><Suspense fallback={<LoadingFallback />}><DeliveryPartnersPage /></Suspense></PermissionRoute> },
  { path: 'users/:userId', element: <PermissionRoute permission="users.view"><Suspense fallback={<LoadingFallback />}><UserDetailPage /></Suspense></PermissionRoute> },
  
  // Team & Access
  { path: 'agents', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><AdminAgentsPage /></Suspense></PermissionRoute> },
  { path: 'agents/roles', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><AdminRolesPage /></Suspense></PermissionRoute> },

  // Compliance / KYC
  { path: 'kyc', element: <PermissionRoute permission="users.view"><Suspense fallback={<LoadingFallback />}><AdminKycCenter /></Suspense></PermissionRoute> },

  // Marketplace Setup
  { path: 'cities', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><CitiesPage /></Suspense></PermissionRoute> },
  { path: 'cities/:cityId/zones', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><ZonesPage /></Suspense></PermissionRoute> },
  { path: 'categories', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><CategoriesPage /></Suspense></PermissionRoute> },
  { path: 'brands', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><BrandsPage /></Suspense></PermissionRoute> },

  // Catalog
  { path: 'products', element: <PermissionRoute permission="products.view"><Suspense fallback={<LoadingFallback />}><AdminProductsPage /></Suspense></PermissionRoute> },
  { path: 'products/:productId', element: <PermissionRoute permission="products.view"><Suspense fallback={<LoadingFallback />}><ProductDetailPage /></Suspense></PermissionRoute> },
  { path: 'inventory', element: <PermissionRoute permission="inventory.view"><Suspense fallback={<LoadingFallback />}><InventoryOverviewPage /></Suspense></PermissionRoute> },

  // Orders
  { path: 'orders', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><AdminOrdersPage /></Suspense></PermissionRoute> },
  { path: 'orders/:orderId', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><AdminOrderDetailPage /></Suspense></PermissionRoute> },
  { path: 'returns', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><ReturnsDashboardPage /></Suspense></PermissionRoute> },

  // Finance
  { path: 'payments', element: <PermissionRoute permission="payouts.manage"><Suspense fallback={<LoadingFallback />}><PaymentsPage /></Suspense></PermissionRoute> },
  { path: 'payments/:paymentId', element: <PermissionRoute permission="payouts.manage"><Suspense fallback={<LoadingFallback />}><PaymentDetailPage /></Suspense></PermissionRoute> },
  { path: 'refunds', element: <PermissionRoute permission="payouts.manage"><Suspense fallback={<LoadingFallback />}><RefundsPage /></Suspense></PermissionRoute> },
  { path: 'payouts', element: <PermissionRoute permission="payouts.manage"><Suspense fallback={<LoadingFallback />}><PayoutsPage /></Suspense></PermissionRoute> },
  { path: 'commissions', element: <PermissionRoute permission="payouts.manage"><Suspense fallback={<LoadingFallback />}><CommissionsPage /></Suspense></PermissionRoute> },
  { path: 'wallets', element: <PermissionRoute permission="payouts.manage"><Suspense fallback={<LoadingFallback />}><WalletsPage /></Suspense></PermissionRoute> },

  // Reputation
  { path: 'reviews', element: <PermissionRoute permission="reviews.view"><Suspense fallback={<LoadingFallback />}><AdminReviewsPage /></Suspense></PermissionRoute> },
  { path: 'ratings', element: <PermissionRoute permission="reviews.view"><Suspense fallback={<LoadingFallback />}><AdminRatingsPage /></Suspense></PermissionRoute> },

  // Operations
  { path: 'disputes', element: <PermissionRoute permission="support.view"><Suspense fallback={<LoadingFallback />}><DisputesPage /></Suspense></PermissionRoute> },
  { path: 'disputes/:disputeId', element: <PermissionRoute permission="support.view"><Suspense fallback={<LoadingFallback />}><DisputeDetailPage /></Suspense></PermissionRoute> },
  { path: 'support', element: <PermissionRoute permission="support.view"><Suspense fallback={<LoadingFallback />}><SupportTicketsPage /></Suspense></PermissionRoute> },
  { path: 'support/:id', element: <PermissionRoute permission="support.view"><Suspense fallback={<LoadingFallback />}><SupportTicketChatPage /></Suspense></PermissionRoute> },
  { path: 'notifications', element: <PermissionRoute permission="notifications.view"><Suspense fallback={<LoadingFallback />}><NotificationsPage /></Suspense></PermissionRoute> },
  { path: 'announcements', element: <PermissionRoute permission="notifications.view"><Suspense fallback={<LoadingFallback />}><AnnouncementsPage /></Suspense></PermissionRoute> },

  // Marketing
  { path: 'banners', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><BannersPage /></Suspense></PermissionRoute> },
  { path: 'advertisements', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><AdvertisementsPage /></Suspense></PermissionRoute> },
  { path: 'coupons', element: <PermissionRoute permission="coupons.view"><Suspense fallback={<LoadingFallback />}><CouponsPage /></Suspense></PermissionRoute> },

  // CMS
  { path: 'cms/pages', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><CmsPagesPage /></Suspense></PermissionRoute> },
  { path: 'cms/blogs', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><CmsBlogsPage /></Suspense></PermissionRoute> },
  { path: 'cms/faq', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><CmsFaqPage /></Suspense></PermissionRoute> },

  // Templates
  { path: 'templates/email', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><EmailTemplatesPage /></Suspense></PermissionRoute> },
  { path: 'templates/sms', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><SmsTemplatesPage /></Suspense></PermissionRoute> },
  { path: 'templates/push', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><PushTemplatesPage /></Suspense></PermissionRoute> },

  // Access Control
  { path: 'roles', element: <PermissionRoute permission="users.manage"><Suspense fallback={<LoadingFallback />}><RolesPage /></Suspense></PermissionRoute> },
  { path: 'permissions', element: <PermissionRoute permission="users.manage"><Suspense fallback={<LoadingFallback />}><PermissionsPage /></Suspense></PermissionRoute> },

  // Monitoring
  { path: 'audit-logs', element: <PermissionRoute permission="audit.view"><Suspense fallback={<LoadingFallback />}><AuditLogsPage /></Suspense></PermissionRoute> },
  { path: 'system-logs', element: <PermissionRoute permission="audit.view"><Suspense fallback={<LoadingFallback />}><SystemLogsPage /></Suspense></PermissionRoute> },
  { path: 'fraud', element: <PermissionRoute permission="audit.view"><Suspense fallback={<LoadingFallback />}><FraudMonitoringPage /></Suspense></PermissionRoute> },
  { path: 'health', element: <PermissionRoute permission="audit.view"><Suspense fallback={<LoadingFallback />}><HealthStatusPage /></Suspense></PermissionRoute> },

  // Platform
  { path: 'settings', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense></PermissionRoute> },
  { path: 'integrations', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><IntegrationsPage /></Suspense></PermissionRoute> },

  // Insights
  { path: 'reports', element: <PermissionRoute permission="analytics.view"><Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense></PermissionRoute> },
  { path: 'analytics', element: <PermissionRoute permission="analytics.view"><Suspense fallback={<LoadingFallback />}><AnalyticsPage /></Suspense></PermissionRoute> },
  
  // Profile
  { path: 'profile', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><AdminProfilePage /></Suspense></PermissionRoute> },

  // Database Explorer
  { 
    path: 'database-explorer', 
    element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><DatabaseExplorerLayout /></Suspense></PermissionRoute>,
    children: [
      { path: '', element: <Suspense fallback={<LoadingFallback />}><DashboardOverview /></Suspense> },
      { path: 'collection/:collectionName', element: <Suspense fallback={<LoadingFallback />}><DocumentExplorer /></Suspense> }
    ]
  },
  
  // Configuration Center
  {
    path: 'configuration',
    element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><ConfigurationLayout /></Suspense></PermissionRoute>,
    children: [
      { path: '', element: <Suspense fallback={<LoadingFallback />}><ConfigDashboard /></Suspense> },
      { path: 'secrets', element: <Suspense fallback={<LoadingFallback />}><SecretsVault /></Suspense> },
      { path: 'apis', element: <Suspense fallback={<LoadingFallback />}><ApiManagement /></Suspense> },
      { path: 'integrations', element: <Suspense fallback={<LoadingFallback />}><PlaceholderPage title="Integrations" /></Suspense> },
      { path: 'features', element: <Suspense fallback={<LoadingFallback />}><PlaceholderPage title="Feature Flags" /></Suspense> },
      { path: 'smtp', element: <Suspense fallback={<LoadingFallback />}><PlaceholderPage title="SMTP & Email" /></Suspense> },
      { path: 'ai', element: <Suspense fallback={<LoadingFallback />}><PlaceholderPage title="AI Providers" /></Suspense> }
    ]
  },
  
  // AI Control Panel
  {
    path: 'ai',
    element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><AiKnowledgeCenterLayout /></Suspense></PermissionRoute>,
    children: [
      { path: 'knowledge', element: <Suspense fallback={<LoadingFallback />}><KnowledgeBasePage /></Suspense> },
      { path: 'analytics', element: <Suspense fallback={<LoadingFallback />}><AiAnalyticsPage /></Suspense> }
    ]
  },
  
  // AI Standalone Pages
  { path: 'ai/workforce', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><WorkforceCenter /></Suspense></PermissionRoute> },
  { path: 'ai/approvals', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><ApprovalQueue /></Suspense></PermissionRoute> },
  { path: 'ai/audit', element: <PermissionRoute permission="settings.manage"><Suspense fallback={<LoadingFallback />}><AuditCenter /></Suspense></PermissionRoute> }
];

export default adminRoutes;
