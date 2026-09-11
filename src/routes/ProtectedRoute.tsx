import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTypedSelector } from 'store/store';
import { isTokenExpired } from 'utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { access, access_expires_at } = useTypedSelector((state) => state.auth);

  if (!access || isTokenExpired(access_expires_at)) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;