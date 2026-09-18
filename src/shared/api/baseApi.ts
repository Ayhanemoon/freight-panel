import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query';
import { logout } from 'features/accounts/state/authSlice';
import { createApi } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.VITE_API_BASE_URL || '/api',

  prepareHeaders: (headers) => {
    const accessToken = localStorage.getItem('access');

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('refresh');

    // No refresh token → logout
    if (!refreshToken) {
      api.dispatch(logout());
      window.location.href = '/auth';

      return result;
    }

    // Try to refresh the access token
    const refreshResult = await rawBaseQuery(
      {
        url: 'accounts/api/v1/jwt/refresh/',
        method: 'POST',
        body: {
          refresh: refreshToken,
        },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        access: string;
      };

      const newAccessExpiresAt = getTokenExpiration(data.access);

      if (!newAccessExpiresAt) {
        api.dispatch(logout());
        window.location.href = '/auth';

        return result;
      }

      // Store the new access token
      localStorage.setItem('access', data.access);
      localStorage.setItem(
        'access_expires_at',
        newAccessExpiresAt
      );

      // Retry the original request with the new access token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed → logout
      api.dispatch(logout());
      window.location.href = '/auth';
    }
  }

  return result;
};

const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: baseQueryWithReauth,

  tagTypes: ['Auth', 'User', 'Product'],

  endpoints: () => ({}),
});

export default baseApi;