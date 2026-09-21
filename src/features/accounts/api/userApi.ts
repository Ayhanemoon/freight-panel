import baseApi from 'shared/api/baseApi';
import { PaginatedResponse } from 'shared/types/api';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';

import { User } from 'features/accounts/types/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      PaginatedResponse<User>,
      ListQueryParams | void
    >({
      query: (params) =>
        `accounts/api/v1/users/${buildQueryString(params)}`,

      providesTags: (result) =>
        result
          ? [
              { type: 'User', id: 'LIST' },
              ...result.results.map((user) => ({
                type: 'User' as const,
                id: user.id,
              })),
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `accounts/api/v1/users/${id}/`,

      providesTags: (result, error, id) => [
        { type: 'User', id },
      ],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (newUser) => ({
        url: 'accounts/api/v1/users/',
        method: 'POST',
        body: newUser,
      }),

      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
} = userApi;