import { Middleware } from '@reduxjs/toolkit';
import { logout, setCredentials } from './authSlice';
import { isTokenExpired } from 'utils/authUtils';

export const authMiddleware: Middleware = (store) => (next) => async (action) => {
  const state = store.getState();
  const { access, refresh, access_expires_at, refresh_expires_at, user_id, mobile } = state.auth;

  // Check if the access token is expired
  if (access && isTokenExpired(access_expires_at)) {
    if (refresh) {
      try {
        // Call the refresh token API
        const refreshResponse = await store.dispatch(refresh({ refresh }));

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          store.dispatch(
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
          // If refresh fails, log the user out
          store.dispatch(logout());
          window.location.href = '/auth'; // Redirect to login page
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        store.dispatch(logout());
        window.location.href = '/auth'; // Redirect to login page
      }
    } else {
      // If no refresh token, log the user out
      store.dispatch(logout());
      window.location.href = '/auth'; // Redirect to login page
    }
  }

  return next(action);
};