import api from 'features/api/api';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => 'accounts/api/v1/users/',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `accounts/api/v1/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation({
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