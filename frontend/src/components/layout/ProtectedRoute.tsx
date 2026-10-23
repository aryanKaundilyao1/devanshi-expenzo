import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, onboardingCompleted } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve intended destination path
    const nextParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${nextParam}`} replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
