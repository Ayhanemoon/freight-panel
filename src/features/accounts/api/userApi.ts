import baseApi from 'shared/api/baseApi';
import { PaginatedResponse } from 'shared/types/api';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';

interface User {
  id: number;
  mobile: string;
  email: string;
  branch: number | null;
  branch_name: string | null;
  is_active: boolean;
  is_mobile_verified: boolean;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}


export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>,ListQueryParams | void>({
      query: (params) =>
        `accounts/api/v1/users/${buildQueryString(params)}`,
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `accounts/api/v1/users/${id}/`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (newUser) => ({
        url: 'accounts/api/v1/users/',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
} = userApi;