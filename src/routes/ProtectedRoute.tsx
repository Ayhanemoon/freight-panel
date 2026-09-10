import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTypedSelector } from 'store/store';
import { isTokenExpired } from 'utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { accessToken, expirationDate } = useTypedSelector((state) => state.auth);

  if (!accessToken || isTokenExpired(expirationDate)) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;