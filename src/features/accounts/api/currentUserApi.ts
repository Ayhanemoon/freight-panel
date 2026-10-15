import baseApi from 'shared/api/baseApi';
import { CurrentUserCapabilities } from 'features/accounts/types/currentUser';

export const currentUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUserCapabilities: builder.query<
      CurrentUserCapabilities,
      void
    >({
      query: () => 'accounts/api/v1/me/capabilities/',
    }),
  }),
});

export const { useGetCurrentUserCapabilitiesQuery } = currentUserApi;