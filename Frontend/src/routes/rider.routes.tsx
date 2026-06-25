import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PermissionRoute from '@/features/auth/guards/PermissionRoute';
import FeatureRoute from '@/features/auth/guards/FeatureRoute';
import { Skeleton } from '@/components/ui/Skeleton';

// Dashboard
const RiderDashboard = lazy(() => import('@/features/rider/RiderDashboard'));

// Deliveries
const AvailableDeliveriesPage = lazy(() => import('@/features/rider/pages/AvailableDeliveriesPage'));
const RequestedDeliveriesPage = lazy(() => import('@/features/rider/pages/RequestedDeliveriesPage'));
const AssignedDeliveriesPage = lazy(() => import('@/features/rider/pages/AssignedDeliveriesPage'));
const PickupQueuePage = lazy(() => import('@/features/rider/pages/PickupQueuePage'));
const InTransitPage = lazy(() => import('@/features/rider/pages/InTransitPage'));
const CompletedDeliveriesPage = lazy(() => import('@/features/rider/pages/CompletedDeliveriesPage'));
const FailedDeliveriesPage = lazy(() => import('@/features/rider/pages/FailedDeliveriesPage'));
const DeliveryDetailsPage = lazy(() => import('@/features/rider/pages/DeliveryDetailsPage'));
const ReturnPickupsPage = lazy(() => import('@/features/rider/pages/ReturnPickupsPage'));

// Finance
const EarningsDashboardPage = lazy(() => import('@/features/rider/pages/EarningsDashboardPage'));
const WalletPage = lazy(() => import('@/features/rider/pages/WalletPage'));

// Performance
const RatingsPage = lazy(() => import('@/features/rider/pages/RatingsPage'));

// Verification
const DocumentsPage = lazy(() => import('@/features/rider/pages/DocumentsPage'));
const KycPage = lazy(() => import('@/features/rider/pages/RiderKycPage'));

// Communication
const NotificationsPage = lazy(() => import('@/features/rider/pages/NotificationsPage'));
const SupportPage = lazy(() => import('@/features/rider/pages/SupportPage'));

// Account
const ProfilePage = lazy(() => import('@/features/rider/pages/ProfilePage'));
const SecurityPage = lazy(() => import('@/features/rider/pages/SecurityPage'));
const SettingsPage = lazy(() => import('@/features/rider/pages/SettingsPage'));
const ActivityLogsPage = lazy(() => import('@/features/rider/pages/ActivityLogsPage'));

const LoadingFallback = () => (
  <div className="p-6 space-y-4 max-w-7xl mx-auto w-full text-left">
    <Skeleton className="h-10 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-72" />
  </div>
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-surface border border-border rounded-xl">
    <h2 className="text-xl font-bold">{title}</h2>
    <p className="text-sm text-text-secondary mt-2">This page is under construction.</p>
  </div>
);

export const riderRoutes: RouteObject[] = [
  { path: '', element: <Suspense fallback={<LoadingFallback />}><RiderDashboard /></Suspense> },

  // Deliveries
  { path: 'deliveries/available', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><AvailableDeliveriesPage /></Suspense></PermissionRoute> },
  { path: 'deliveries/requested', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><RequestedDeliveriesPage /></Suspense></PermissionRoute> },
  { path: 'deliveries/assigned', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><AssignedDeliveriesPage /></Suspense></PermissionRoute> },
  { path: 'deliveries/pickup-queue', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><PickupQueuePage /></Suspense></PermissionRoute> },
  { path: 'deliveries/in-transit', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><InTransitPage /></Suspense></PermissionRoute> },
  { path: 'deliveries/completed', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><CompletedDeliveriesPage /></Suspense></PermissionRoute> },
  { path: 'deliveries/failed', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><FailedDeliveriesPage /></Suspense></PermissionRoute> },
  { path: 'deliveries/:deliveryId', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><DeliveryDetailsPage /></Suspense></PermissionRoute> },
  { path: 'return-pickups', element: <PermissionRoute permission="deliveries.view"><Suspense fallback={<LoadingFallback />}><ReturnPickupsPage /></Suspense></PermissionRoute> },

  // Finance
  { path: 'earnings', element: <FeatureRoute feature="wallet"><Suspense fallback={<LoadingFallback />}><EarningsDashboardPage /></Suspense></FeatureRoute> },
  { path: 'wallet', element: <FeatureRoute feature="wallet"><Suspense fallback={<LoadingFallback />}><WalletPage /></Suspense></FeatureRoute> },

  // Performance
  { path: 'ratings', element: <Suspense fallback={<LoadingFallback />}><RatingsPage /></Suspense> },

  // Verification
  { path: 'documents', element: <Suspense fallback={<LoadingFallback />}><DocumentsPage /></Suspense> },
  { path: 'kyc', element: <Suspense fallback={<LoadingFallback />}><KycPage /></Suspense> },

  // Communication
  { path: 'notifications', element: <Suspense fallback={<LoadingFallback />}><NotificationsPage /></Suspense> },
  { path: 'support', element: <Suspense fallback={<LoadingFallback />}><SupportPage /></Suspense> },

  // Account
  { path: 'profile', element: <Suspense fallback={<LoadingFallback />}><ProfilePage /></Suspense> },
  { path: 'security', element: <Suspense fallback={<LoadingFallback />}><SecurityPage /></Suspense> },
  { path: 'settings', element: <Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense> },
  { path: 'activity-logs', element: <Suspense fallback={<LoadingFallback />}><ActivityLogsPage /></Suspense> },
];

export default riderRoutes;
