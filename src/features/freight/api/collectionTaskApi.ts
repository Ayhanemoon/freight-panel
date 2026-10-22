
import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';

import {
  CollectionTask,
  AssignCollectionTaskRequest,
  CollectionTaskStatusRequest,
  VerifyCollectionTaskParcelRequest,
  VerifyCollectionTaskParcelResponse,
} from 'features/freight/types/collectionTask';

export interface CollectionTaskListParams extends ListQueryParams {
  branch?: number;
}

export interface CreateCollectionTaskRequest {
  order: number;
  task_type: CollectionTask['task_type'];
  scheduled_at: string | null;
  notes: string;
}

export const collectionTaskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCollectionTasks: builder.query<
      PaginatedResponse<CollectionTask>,
      CollectionTaskListParams | void
    >({
      query: (params) =>
        `freight/api/v1/collection-tasks/${buildQueryString(params)}`,
      providesTags: (result) => [
        { type: 'CollectionTask', id: 'LIST' },
        ...(result?.results ?? []).map((task) => ({
          type: 'CollectionTask' as const,
          id: task.id,
        })),
      ],
    }),

    createCollectionTask: builder.mutation<
      CollectionTask,
      CreateCollectionTaskRequest
    >({
      query: (body) => ({
        url: 'freight/api/v1/collection-tasks/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'CollectionTask', id: 'LIST' },
      ],
    }),

    getCollectionTaskById: builder.query<
      CollectionTask,
      number | string
    >({
      query: (id) => `freight/api/v1/collection-tasks/${id}/`,
      providesTags: (_result, _error, id) => [
        { type: 'CollectionTask', id },
      ],
    }),

    assignCollectionTask: builder.mutation<
      CollectionTask,
      { id: number | string } & AssignCollectionTaskRequest
    >({
      query: ({ id, collector }) => ({
        url: `freight/api/v1/collection-tasks/${id}/assign/`,
        method: 'POST',
        body: { collector },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CollectionTask', id },
        { type: 'CollectionTask', id: 'LIST' },
      ],
    }),

    verifyCollectionTaskParcel: builder.mutation<
      VerifyCollectionTaskParcelResponse,
      {
        taskId: number | string;
        data: VerifyCollectionTaskParcelRequest;
      }
    >({
      query: ({ taskId, data }) => ({
        url: `freight/api/v1/collection-tasks/${taskId}/verify-parcel/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { taskId, data }) => [
        { type: 'CollectionTask', id: taskId },
        { type: 'CollectionTask', id: 'LIST' },
        { type: 'Parcel', id: data.parcel },
        { type: 'Parcel', id: 'LIST' },
      ],
    }),

    completeCollectionTask: builder.mutation<
      CollectionTask,
      number | string
    >({
      query: (id) => ({
        url: `freight/api/v1/collection-tasks/${id}/complete/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'CollectionTask', id },
        { type: 'CollectionTask', id: 'LIST' },
      ],
    }),

    cancelCollectionTask: builder.mutation<
      CollectionTask,
      { id: number | string } & CollectionTaskStatusRequest
    >({
      query: ({ id, note }) => ({
        url: `freight/api/v1/collection-tasks/${id}/cancel/`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CollectionTask', id },
        { type: 'CollectionTask', id: 'LIST' },
      ],
    }),

    failCollectionTask: builder.mutation<
      CollectionTask,
      { id: number | string } & CollectionTaskStatusRequest
    >({
      query: ({ id, note }) => ({
        url: `freight/api/v1/collection-tasks/${id}/fail/`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CollectionTask', id },
        { type: 'CollectionTask', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCollectionTasksQuery,
  useCreateCollectionTaskMutation,
  useGetCollectionTaskByIdQuery,
  useAssignCollectionTaskMutation,
  useVerifyCollectionTaskParcelMutation,
  useCompleteCollectionTaskMutation,
  useCancelCollectionTaskMutation,
  useFailCollectionTaskMutation,
} = collectionTaskApi;
