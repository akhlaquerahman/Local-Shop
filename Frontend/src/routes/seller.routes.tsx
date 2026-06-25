import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PermissionRoute from '@/features/auth/guards/PermissionRoute';
import { Skeleton } from '@/components/ui/Skeleton';

// Base layout and dashboard
const SellerDashboard = lazy(() => import('@/features/seller/SellerDashboard'));

// Catalog
const ProductsPage = lazy(() => import('@/features/seller/pages/ProductsPage'));
const ProductCreatePage = lazy(() => import('@/features/seller/pages/ProductCreatePage'));
const ProductEditPage = lazy(() => import('@/features/seller/pages/ProductEditPage'));
const ProductDetailsPage = lazy(() => import('@/features/seller/pages/ProductDetailsPage'));
const BulkUploadPage = lazy(() => import('@/features/seller/pages/BulkUploadPage'));
const InventoryPage = lazy(() => import('@/features/seller/pages/InventoryPage'));

// Orders
const OrdersPage = lazy(() => import('@/features/seller/pages/OrdersPage'));
const OrderDetailsPage = lazy(() => import('@/features/seller/pages/OrderDetailsPage'));
const DeliveryRequestsPage = lazy(() => import('@/features/seller/pages/DeliveryRequestsPage'));
const DeliveryPartnersPage = lazy(() => import('@/features/seller/pages/DeliveryPartnersPage'));
const ReturnsManagementPage = lazy(() => import('@/features/seller/pages/ReturnsManagementPage'));

// Customers
const CustomersPage = lazy(() => import('@/features/seller/pages/CustomersPage'));

// Analytics & Finance
const RevenuePage = lazy(() => import('@/features/seller/pages/RevenuePage')); // Kept just in case, but route removed below
const AnalyticsDashboardPage = lazy(() => import('@/features/seller/pages/AnalyticsDashboardPage'));
const ProductAnalyticsPage = lazy(() => import('@/features/seller/pages/ProductAnalyticsPage'));
const CustomerAnalyticsPage = lazy(() => import('@/features/seller/pages/CustomerAnalyticsPage'));
const PayoutsPage = lazy(() => import('@/features/seller/pages/PayoutsPage'));

// Marketing
const ReviewsPage = lazy(() => import('@/features/seller/pages/ReviewsPage'));
const CouponsPage = lazy(() => import('@/features/seller/pages/CouponsPage'));
const PromotionsPage = lazy(() => import('@/features/seller/pages/PromotionsPage'));
const MarketingPage = lazy(() => import('@/features/seller/pages/MarketingPage'));

// Shop & Settings
const ShopSettingsPage = lazy(() => import('@/features/seller/pages/ShopSettingsPage'));
const KycDocumentsPage = lazy(() => import('@/features/seller/pages/KycDocumentsPage'));
const StaffPage = lazy(() => import('@/features/seller/pages/StaffPage'));
const RoleManagementPage = lazy(() => import('@/features/seller/pages/RoleManagementPage'));
const NotificationsPage = lazy(() => import('@/features/seller/pages/NotificationsPage'));
const ReportsPage = lazy(() => import('@/features/seller/pages/ReportsPage'));
const SupportPage = lazy(() => import('@/features/seller/pages/SupportPage'));
const ProfilePage = lazy(() => import('@/features/seller/pages/ProfilePage'));
const SecurityPage = lazy(() => import('@/features/seller/pages/SecurityPage'));
const ActivityLogsPage = lazy(() => import('@/features/seller/pages/ActivityLogsPage'));

const LoadingFallback = () => (
  <div className="p-6 space-y-4 max-w-7xl mx-auto w-full text-left">
    <Skeleton className="h-10 w-48" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-72" />
  </div>
);

// We define a generic placeholder for the "list" pages that aren't fully implemented yet,
// so that the routing doesn't break if the physical file hasn't been created yet.
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-surface border border-border rounded-xl">
    <h2 className="text-xl font-bold">{title}</h2>
    <p className="text-sm text-text-secondary mt-2">This page is under construction.</p>
  </div>
);

export const sellerRoutes: RouteObject[] = [
  { path: '', element: <Suspense fallback={<LoadingFallback />}><SellerDashboard /></Suspense> },
  
  // Catalog
  { path: 'products', element: <PermissionRoute permission="products.view"><Suspense fallback={<LoadingFallback />}><ProductsPage /></Suspense></PermissionRoute> },
  { path: 'products/create', element: <PermissionRoute permission="products.create"><Suspense fallback={<LoadingFallback />}><ProductCreatePage /></Suspense></PermissionRoute> },
  { path: 'products/:id/edit', element: <PermissionRoute permission="products.edit"><Suspense fallback={<LoadingFallback />}><ProductEditPage /></Suspense></PermissionRoute> },
  { path: 'products/:id', element: <PermissionRoute permission="products.view"><Suspense fallback={<LoadingFallback />}><ProductDetailsPage /></Suspense></PermissionRoute> },
  { path: 'products/bulk-upload', element: <PermissionRoute permission="products.create"><Suspense fallback={<LoadingFallback />}><BulkUploadPage /></Suspense></PermissionRoute> },
  { path: 'inventory', element: <PermissionRoute permission="inventory.view"><Suspense fallback={<LoadingFallback />}><InventoryPage /></Suspense></PermissionRoute> },

  // Orders
  { path: 'orders', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><OrdersPage /></Suspense></PermissionRoute> },
  { path: 'orders/:orderId', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><OrderDetailsPage /></Suspense></PermissionRoute> },
  { path: 'orders/delivery-requests', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><DeliveryRequestsPage /></Suspense></PermissionRoute> },
  { path: 'delivery-partners', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><DeliveryPartnersPage /></Suspense></PermissionRoute> },
  { path: 'returns', element: <PermissionRoute permission="orders.view"><Suspense fallback={<LoadingFallback />}><ReturnsManagementPage /></Suspense></PermissionRoute> },

  // Customers
  { path: 'customers', element: <PermissionRoute permission="analytics.view"><Suspense fallback={<LoadingFallback />}><CustomersPage /></Suspense></PermissionRoute> },

  // Analytics (Moved to Dashboard Overview)
  // Routes for individual analytics pages have been removed as per request to consolidate into dashboard.

  // Finance
  { path: 'payouts', element: <PermissionRoute permission="payouts.view"><Suspense fallback={<LoadingFallback />}><PayoutsPage /></Suspense></PermissionRoute> },

  // Reviews
  { path: 'reviews', element: <PermissionRoute permission="reviews.view"><Suspense fallback={<LoadingFallback />}><ReviewsPage /></Suspense></PermissionRoute> },

  // Marketing
  { path: 'coupons', element: <PermissionRoute permission="coupons.view"><Suspense fallback={<LoadingFallback />}><CouponsPage /></Suspense></PermissionRoute> },
  { path: 'promotions', element: <PermissionRoute permission="coupons.view"><Suspense fallback={<LoadingFallback />}><PromotionsPage /></Suspense></PermissionRoute> },
  { path: 'marketing', element: <PermissionRoute permission="coupons.view"><Suspense fallback={<LoadingFallback />}><MarketingPage /></Suspense></PermissionRoute> },

  // Shop & Account
  { path: 'settings', element: <PermissionRoute permission="shops.manage"><Suspense fallback={<LoadingFallback />}><ShopSettingsPage /></Suspense></PermissionRoute> },
  { path: 'kyc', element: <PermissionRoute permission="shops.manage"><Suspense fallback={<LoadingFallback />}><KycDocumentsPage /></Suspense></PermissionRoute> },
  { path: 'staff', element: <PermissionRoute permission="shops.manage"><Suspense fallback={<LoadingFallback />}><StaffPage /></Suspense></PermissionRoute> },
  { path: 'staff/roles', element: <PermissionRoute permission="shops.manage"><Suspense fallback={<LoadingFallback />}><RoleManagementPage /></Suspense></PermissionRoute> },
  { path: 'notifications', element: <PermissionRoute permission="notifications.view"><Suspense fallback={<LoadingFallback />}><NotificationsPage /></Suspense></PermissionRoute> },
  { path: 'reports', element: <PermissionRoute permission="analytics.view"><Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense></PermissionRoute> },
  { path: 'support', element: <PermissionRoute permission="support.view"><Suspense fallback={<LoadingFallback />}><SupportPage /></Suspense></PermissionRoute> },
  { path: 'profile', element: <Suspense fallback={<LoadingFallback />}><ProfilePage /></Suspense> },
  { path: 'security', element: <Suspense fallback={<LoadingFallback />}><SecurityPage /></Suspense> },
  { path: 'activity-logs', element: <Suspense fallback={<LoadingFallback />}><ActivityLogsPage /></Suspense> },
];

export default sellerRoutes;
