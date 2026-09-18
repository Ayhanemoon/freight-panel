import baseApi from 'shared/api/baseApi';
import { setCredentials } from 'features/auth/authSlice';

interface LoginCredentials {
  mobile: string;
  password: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  access_expires_at: string;
  refresh_expires_at: string;
  user_id: string;
  mobile: string;
}

interface RefreshResponse {
  access: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: 'accounts/api/v1/jwt/create/',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

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

    refreshAuthToken: builder.mutation<RefreshResponse, string>({
      query: (refreshToken) => ({
        url: 'accounts/api/v1/jwt/refresh/',
        method: 'POST',
        body: {
          refresh: refreshToken,
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshAuthTokenMutation,
} = authApi;