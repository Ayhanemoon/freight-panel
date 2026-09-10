import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const entityApi = createApi({
  reducerPath: 'entityApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Entity'], // Define tags for the entity
  endpoints: (builder) => ({
    getEntities: builder.query({
      query: ({ entity, page = 1, limit = 10 }) =>
        `/${entity}?page=${page}&limit=${limit}`,
      providesTags: (result, error, entity) =>
        result
          ? [...result.map(({ id }: { id: string }) => ({ type: 'Entity', id })), { type: 'Entity', id: 'LIST' }]
          : [{ type: 'Entity', id: 'LIST' }],
    }),
    getEntity: builder.query({
      query: ({ entity, id }) => `/${entity}/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Entity', id }],
    }),
    createEntity: builder.mutation({
      query: ({ entity, data }) => ({
        url: `/${entity}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Entity', id: 'LIST' }],
    }),
    updateEntity: builder.mutation({
      query: ({ entity, id, data }) => ({
        url: `/${entity}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Entity', id }],
    }),
    deleteEntity: builder.mutation({
      query: ({ entity, id }) => ({
        url: `/${entity}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Entity', id }, { type: 'Entity', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetEntitiesQuery,
  useGetEntityQuery,
  useCreateEntityMutation,
  useUpdateEntityMutation,
  useDeleteEntityMutation,
} = entityApi;