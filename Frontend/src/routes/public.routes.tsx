import { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import GuestRoute from '@/features/auth/guards/GuestRoute';
import { Skeleton } from '@/components/ui/Skeleton';

const Login = lazy(() => import('@/features/auth/pages/Login'));
const Register = lazy(() => import('@/features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'));
const OtpVerification = lazy(() => import('@/features/auth/pages/OtpVerification'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmail'));
const UnderReview = lazy(() => import('@/features/auth/pages/UnderReview'));
const AccountSuspended = lazy(() => import('@/features/auth/pages/AccountSuspended'));
const StaffLogin = lazy(() => import('@/features/auth/pages/StaffLogin'));

const loadingFallbackElement = (
  <div className="p-6 space-y-4 w-full">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const MarketingLayout = lazy(() => import('@/layouts/MarketingLayout'));
const AboutUsPage = lazy(() => import('@/features/public/pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('@/features/public/pages/ContactUsPage'));
const PrivacyPolicyPage = lazy(() => import('@/features/public/pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/features/public/pages/TermsPage'));
const ReturnPolicyPage = lazy(() => import('@/features/public/pages/ReturnPolicyPage'));

export const marketingRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={loadingFallbackElement}>
        <MarketingLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'about', element: <AboutUsPage /> },
      { path: 'contact', element: <ContactUsPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'returns', element: <ReturnPolicyPage /> },
    ]
  }
];

export const publicRoutes: RouteObject[] = [
  // 1. Root-level Public Guest Routes
  {
    path: 'login',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <Login />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'register',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <Register />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'forgot-password',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <ForgotPassword />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'reset-password',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <ResetPassword />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'otp-verification',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <OtpVerification />
        </Suspense>
      </GuestRoute>
    ),
  },

  // 2. /auth/ Aliased Paths (Supports both direct links and subdirectory nesting)
  {
    path: 'auth/login',
    element: <Navigate to="/login" replace />,
  },
  {
    path: 'auth/register',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <Register />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'auth/forgot-password',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <ForgotPassword />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'auth/reset-password',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <ResetPassword />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: 'auth/otp-verification',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <OtpVerification />
        </Suspense>
      </GuestRoute>
    ),
  },

  // 3. User Onboarding Status Screens
  {
    path: 'auth/verify-email',
    element: (
      <Suspense fallback={loadingFallbackElement}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  {
    path: 'auth/under-review',
    element: (
      <Suspense fallback={loadingFallbackElement}>
        <UnderReview />
      </Suspense>
    ),
  },
  {
    path: 'auth/suspended',
    element: (
      <Suspense fallback={loadingFallbackElement}>
        <AccountSuspended />
      </Suspense>
    ),
  },
  {
    path: 'staff/login',
    element: (
      <GuestRoute>
        <Suspense fallback={loadingFallbackElement}>
          <StaffLogin />
        </Suspense>
      </GuestRoute>
    ),
  },
];

export default publicRoutes;
