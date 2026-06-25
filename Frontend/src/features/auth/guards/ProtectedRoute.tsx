import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import SessionWarningModal from '../components/SessionWarningModal';

import { getUserAccessState } from '../services/userAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that ensures the user is logged in.
 * Redirects to `/login` if unauthenticated.
 * Automatically enforces account status redirects (suspended, pending verification, under KYC review).
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and store the source location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const accessState = getUserAccessState(user);

  if (accessState === 'suspended') {
    return <Navigate to="/auth/suspended" replace />;
  }

  if (accessState === 'under_review') {
    return <Navigate to="/auth/under-review" replace />;
  }

  if (accessState === 'pending_verification') {
    return <Navigate to="/auth/verify-email" replace />;
  }

  if (accessState === 'blocked') {
    return <Navigate to="/login" replace />;
  }


  return (
    <>
      {children}
      <SessionWarningModal />
    </>
  );
};

export default ProtectedRoute;
