import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setCredentials, logout } from 'features/accounts/state/authSlice';
import { useRefreshAuthTokenMutation } from 'features/accounts/api/authApi';
import { isTokenExpired } from 'utils/authUtils';

const getTokenExpiration = (token: string): string | null => {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    if (!payload.exp) {
      return null;
    }

    return new Date(payload.exp * 1000).toISOString();
  } catch {
    return null;
  }
};

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshAuthToken] = useRefreshAuthTokenMutation();

  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem('access');
      const refresh = localStorage.getItem('refresh');
      const access_expires_at = localStorage.getItem('access_expires_at');
      const refresh_expires_at = localStorage.getItem('refresh_expires_at');
      const user_id = localStorage.getItem('user_id');
      const mobile = localStorage.getItem('mobile');

      // No stored authentication
      if (!access || !refresh || !user_id || !mobile) {
        setIsInitialized(true);
        return;
      }

      try {
        // Access token is still valid.
        if (access_expires_at && !isTokenExpired(access_expires_at)) {
          dispatch(
            setCredentials({
              access,
              refresh,
              access_expires_at,
              refresh_expires_at: refresh_expires_at || '',
              user_id,
              mobile,
            })
          );

          setIsInitialized(true);
          return;
        }

        // Access token expired. Try to refresh it.
        const response = await refreshAuthToken(refresh).unwrap();

        const newAccess = response.access;
        const newAccessExpiresAt = getTokenExpiration(newAccess);

        if (!newAccessExpiresAt) {
          throw new Error('Could not determine access token expiration');
        }

        dispatch(
          setCredentials({
            access: newAccess,
            refresh,
            access_expires_at: newAccessExpiresAt,
            refresh_expires_at: refresh_expires_at || '',
            user_id,
            mobile,
          })
        );
      } catch (error) {
        console.error('Authentication initialization failed:', error);

        dispatch(logout());
        navigate('/auth', { replace: true });
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch, navigate, refreshAuthToken]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthInitializer;