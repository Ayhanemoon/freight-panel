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
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const expirationDate = localStorage.getItem('expirationDate');

      if (accessToken && expirationDate) {
        if (isTokenExpired(expirationDate)) {
          if (refreshToken) {
            try {
              // Attempt to refresh the token
                const response = await refreshAuthToken(refreshToken).unwrap();

              if (response.ok) {
                const data = response;
                dispatch(
                  setCredentials({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    expirationDate: data.expirationDate,
                    user: JSON.parse(localStorage.getItem('user') || '{}'),
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
              accessToken,
              refreshToken: refreshToken || '',
              expirationDate,
              user: JSON.parse(localStorage.getItem('user') || '{}'),
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