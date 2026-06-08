import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredModule?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredModule }) => {
  const { user, loading } = useAuth();
  const { hasAccess } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  if (requiredModule && !hasAccess(requiredModule)) {
    return <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;