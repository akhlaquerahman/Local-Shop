import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PermissionRoute from '@/features/auth/guards/PermissionRoute';
import { Skeleton } from '@/components/ui/Skeleton';

// Lazy page imports
const CustomerDashboard = lazy(() => import('@/features/customer/CustomerDashboard'));
const CategoriesPage = lazy(() => import('@/features/customer/CategoriesPage'));
const CategoryDetailsPage = lazy(() => import('@/features/customer/CategoryDetailsPage'));
const ShopsPage = lazy(() => import('@/features/customer/ShopsPage'));
const SearchPage = lazy(() => import('@/features/customer/SearchPage'));
const WishlistPage = lazy(() => import('@/features/customer/WishlistPage'));
const CartPage = lazy(() => import('@/features/customer/CartPage'));
const OrdersPage = lazy(() => import('@/features/customer/OrdersPage'));
const OrderTrackingPage = lazy(() => import('@/features/customer/OrderTrackingPage'));
const ReturnTrackingPage = lazy(() => import('@/features/customer/ReturnTrackingPage'));
const InvoicePage = lazy(() => import('@/features/customer/InvoicePage'));
const ShopDetailsPage = lazy(() => import('@/features/customer/ShopDetailsPage'));
const ProductDetailsPage = lazy(() => import('@/features/customer/ProductDetailsPage'));

// New Loyalty & Account pages
const WalletPage = lazy(() => import('@/features/customer/WalletPage'));
const CouponsPage = lazy(() => import('@/features/customer/CouponsPage'));
const ReferralPage = lazy(() => import('@/features/customer/ReferralPage'));
const ProfilePage = lazy(() => import('@/features/customer/ProfilePage'));
const AddressesPage = lazy(() => import('@/features/customer/AddressesPage'));
const ReviewsPage = lazy(() => import('@/features/customer/ReviewsPage'));
const PaymentsPage = lazy(() => import('@/features/customer/PaymentsPage'));
const SecurityPage = lazy(() => import('@/features/customer/SecurityPage'));
const ActivityPage = lazy(() => import('@/features/customer/ActivityPage'));

const CheckoutPage = lazy(() => import('@/features/customer/CheckoutPage'));
const CheckoutPaymentPage = lazy(() => import('@/features/customer/CheckoutPaymentPage'));
const OrderSuccessPage = lazy(() => import('@/features/customer/OrderSuccessPage'));

// New Communication & Preferences pages
const NotificationsPage = lazy(() => import('@/features/customer/NotificationsPage'));
const SupportTicketsPage = lazy(() => import('@/features/customer/SupportTicketsPage'));
const TicketDetailsPage = lazy(() => import('@/features/customer/TicketDetailsPage'));
const SettingsPage = lazy(() => import('@/features/customer/SettingsPage'));

const LoadingFallback = () => (
  <div className="p-6 space-y-4 max-w-7xl mx-auto w-full text-left">
    <Skeleton className="h-10 w-48" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-36" />
      <Skeleton className="h-36" />
      <Skeleton className="h-36" />
      <Skeleton className="h-36" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

export const customerRoutes: RouteObject[] = [
  // ─── Home / Dashboard ────────────────────────────────────────────────────────
  {
    path: '',
    element: (
      <PermissionRoute permission="products.view">
        <Suspense fallback={<LoadingFallback />}>
          <CustomerDashboard />
        </Suspense>
      </PermissionRoute>
    ),
  },
  
  // ─── Checkout Flow ────────────────────────────────────────────────────────
  {
    path: 'checkout',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CheckoutPage />
      </Suspense>
    ),
  },
  {
    path: 'checkout/payment',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CheckoutPaymentPage />
      </Suspense>
    ),
  },
  {
    path: 'checkout/success',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OrderSuccessPage />
      </Suspense>
    ),
  },

  // ─── Marketplace ─────────────────────────────────────────────────────────────
  {
    path: 'categories',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CategoriesPage />
      </Suspense>
    ),
  },
  {
    path: 'categories/:slug',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CategoryDetailsPage />
      </Suspense>
    ),
  },
  {
    path: 'shops',
    element: (
      <PermissionRoute permission="shops.view">
        <Suspense fallback={<LoadingFallback />}>
          <ShopsPage />
        </Suspense>
      </PermissionRoute>
    ),
  },
  {
    path: 'shops/:shopId',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ShopDetailsPage />
      </Suspense>
    ),
  },
  {
    path: 'products/:productId',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProductDetailsPage />
      </Suspense>
    ),
  },
  {
    path: 'search',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SearchPage />
      </Suspense>
    ),
  },

  // ─── Shopping ────────────────────────────────────────────────────────────────
  {
    path: 'wishlist',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <WishlistPage />
      </Suspense>
    ),
  },
  {
    path: 'cart',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CartPage />
      </Suspense>
    ),
  },

  // ─── Orders ──────────────────────────────────────────────────────────────────
  {
    path: 'orders',
    element: (
      <PermissionRoute permission="orders.view">
        <Suspense fallback={<LoadingFallback />}>
          <OrdersPage />
        </Suspense>
      </PermissionRoute>
    ),
  },
  {
    path: 'orders/:orderId',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OrdersPage />
      </Suspense>
    ),
  },
  {
    path: 'orders/:orderId/track',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OrderTrackingPage />
      </Suspense>
    ),
  },
  {
    path: 'orders/:orderId/invoice',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <InvoicePage />
      </Suspense>
    ),
  },
  {
    path: 'order-tracking',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OrderTrackingPage />
      </Suspense>
    ),
  },
  {
    path: 'orders/returns',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ReturnTrackingPage />
      </Suspense>
    ),
  },

  // ─── Rewards & Loyalty ───────────────────────────────────────────────────────
  {
    path: 'wallet',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <WalletPage />
      </Suspense>
    ),
  },
  {
    path: 'coupons',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CouponsPage />
      </Suspense>
    ),
  },
  {
    path: 'referral',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ReferralPage />
      </Suspense>
    ),
  },

  // ─── Account Settings ────────────────────────────────────────────────────────
  {
    path: 'profile',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProfilePage />
      </Suspense>
    ),
  },
  {
    path: 'addresses',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AddressesPage />
      </Suspense>
    ),
  },
  {
    path: 'reviews',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ReviewsPage />
      </Suspense>
    ),
  },
  {
    path: 'payments',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PaymentsPage />
      </Suspense>
    ),
  },
  {
    path: 'security',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SecurityPage />
      </Suspense>
    ),
  },
  {
    path: 'activity',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ActivityPage />
      </Suspense>
    ),
  },

  // ─── Support & System ────────────────────────────────────────────────────────
  {
    path: 'notifications',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotificationsPage />
      </Suspense>
    ),
  },
  {
    path: 'support',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SupportTicketsPage />
      </Suspense>
    ),
  },
  {
    path: 'support/:ticketId',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TicketDetailsPage />
      </Suspense>
    ),
  },
  {
    path: 'settings',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SettingsPage />
      </Suspense>
    ),
  },
];

export default customerRoutes;
