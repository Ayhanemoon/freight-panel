import api from 'features/api/api';
import { setCredentials } from 'features/auth/authSlice';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'accounts/api/v1/jwt/create/',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch setCredentials to update the store and localStorage
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
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    refreshAuthToken: builder.mutation({
      query: (refreshToken) => ({
        url: 'auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch setCredentials to update the store and localStorage
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
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshAuthTokenMutation } = authApi;