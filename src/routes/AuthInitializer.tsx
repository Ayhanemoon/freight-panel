import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from 'utils/authUtils';
import React, { useEffect, useState } from 'react';
import { setCredentials, logout } from 'features/auth/authSlice';
import { useRefreshAuthTokenMutation } from 'features/api/authApi';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization state
  const [refreshAuthToken] = useRefreshAuthTokenMutation();

  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem('accessToken');
      const refresh = localStorage.getItem('refreshToken');
      const access_expires_at = localStorage.getItem('access_expires_at');
      const refresh_expires_at = localStorage.getItem('refresh_expires_at');
      const user_id = localStorage.getItem('user_id');
      const mobile = localStorage.getItem('mobile');

      if (access && access_expires_at) {
        if (isTokenExpired(access_expires_at)) {
          if (refresh) {
            try {
              // Attempt to refresh the token
                const response = await refreshAuthToken(refresh).unwrap();

              if (response.ok) {
                const data = response;
                dispatch(
                  setCredentials({
                    access: data.access,
                    refresh: data.refresh,
                    access_expires_at: data.access_expires_at,
                    refresh_expires_at: data.refresh_expires_at,
                    user_id: data.user_id,
                    mobile: data.mobile,
                  })
                );
              } else {
                throw new Error('Failed to refresh token');
              }
            } catch (error) {
              console.error('Token refresh failed:', error);
              dispatch(logout());
              navigate('/auth'); // Redirect to login page
            }
          } else {
            dispatch(logout());
            navigate('/auth'); // Redirect to login page
          }
        } else {
          // Token is valid, set it in the Redux store
          dispatch(
            setCredentials({
              access: access || '',
              refresh: refresh || '',
              access_expires_at: access_expires_at || '',
              refresh_expires_at: refresh_expires_at || '',
              user_id: user_id || '',
              mobile: mobile || '',
            })
          );
        }
      } 

      setIsInitialized(true); // Mark initialization as complete
    };

    initializeAuth();
  }, [dispatch, navigate]);

  // Render children only after initialization is complete
  if (!isInitialized) {
    return <div>Loading...</div>; // Show a loading indicator during initialization
  }

  return <>{children}</>;
};

export default AuthInitializer;