import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import SellerLayout from '@/layouts/SellerLayout';
import RiderLayout from '@/layouts/RiderLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Guards
import ProtectedRoute from '@/features/auth/guards/ProtectedRoute';
import RoleRoute from '@/features/auth/guards/RoleRoute';

// Error Pages
import { 
  ForbiddenPage, NotFoundPage, InternalErrorPage, 
  MaintenancePage, OfflinePage 
} from '@/components/ui/ErrorPages';
import { Skeleton } from '@/components/ui/Skeleton';

// Split Routes Configurations
import { publicRoutes, marketingRoutes } from './public.routes';
import { customerRoutes } from './customer.routes';
import { sellerRoutes } from './seller.routes';
import { riderRoutes } from './rider.routes';
import { adminRoutes } from './admin.routes';

// Reusable Loading Boundary Fallback
// Reusable Loading Boundary Fallback
const loadingFallbackElement = (
  <div className="p-6 space-y-4 max-w-7xl mx-auto w-full text-left">
    <div className="flex gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

export const router = createBrowserRouter([
  ...marketingRoutes,

  // Public & Authentication Routes (wrapped in AuthLayout)
  {
    path: '/',
    element: <AuthLayout />,
    children: publicRoutes,
  },

  // Customer Protected Portal (/app)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: customerRoutes,
  },

  // Seller Protected Portal (/seller)
  {
    path: '/seller',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['seller', 'seller_staff', 'admin']}>
          <SellerLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: sellerRoutes,
  },

  // Rider Protected Portal (/rider)
  {
    path: '/rider',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['rider', 'admin']}>
          <RiderLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: riderRoutes,
  },

  // Super Admin Protected Portal (/admin)
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['admin', 'sub_admin', 'support_agent', 'finance_admin', 'catalog_manager', 'city_manager']}>
          <AdminLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: adminRoutes,
  },

  // Public/Utility Error Paths
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '/unauthorized',
    element: <ForbiddenPage />,
  },
  {
    path: '/maintenance',
    element: <MaintenancePage />,
  },
  {
    path: '/offline',
    element: <OfflinePage />,
  },
  {
    path: '/500',
    element: <InternalErrorPage />,
  },
  
  // Catch All Not Found
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
