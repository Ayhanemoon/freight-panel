import { Middleware } from '@reduxjs/toolkit';
import { logout, setCredentials } from './authSlice';
import { isTokenExpired } from 'utils/authUtils';

export const authMiddleware: Middleware = (store) => (next) => async (action) => {
  const state = store.getState();
  const { accessToken, refreshToken, expirationDate } = state.auth;

  // Check if the access token is expired
  if (accessToken && isTokenExpired(expirationDate)) {
    if (refreshToken) {
      try {
        // Call the refresh token API
        const refreshResponse = await store.dispatch(refreshToken({ refreshToken }));

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          store.dispatch(
            setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expirationDate: data.expirationDate,
              user: state.auth.user, // Keep the current user
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