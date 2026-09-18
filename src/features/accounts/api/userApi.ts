import baseApi from 'shared/api/baseApi';

interface User {
  id: string;
  mobile: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_mobile_verified?: boolean;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'accounts/api/v1/users/',
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