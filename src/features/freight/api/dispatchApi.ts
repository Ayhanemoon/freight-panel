import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import {
  AssignFreightRequest,
  CreateDispatchBatchRequest,
  DispatchActionRequest,
  DispatchBatch,
  DispatchDeliveredRequest,
  DispatchFreightAssignment,
  DispatchOrder,
  DispatchRejectRequest,
} from 'features/freight/types/dispatch';

export const dispatchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDispatchBatches: builder.query<
      PaginatedResponse<DispatchBatch>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/dispatch-batches/${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              { type: 'DispatchBatch', id: 'LIST' },
              ...result.results.map(({ id }) => ({
                type: 'DispatchBatch' as const,
                id,
              })),
            ]
          : [{ type: 'DispatchBatch', id: 'LIST' }],
    }),

    getDispatchBatchById: builder.query<DispatchBatch, number | string>({
      query: (id) => `freight/api/v1/dispatch-batches/${id}/`,
      providesTags: (_result, _error, id) => [
        { type: 'DispatchBatch', id },
      ],
    }),

    getDispatchOrders: builder.query<
      PaginatedResponse<DispatchOrder>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/dispatch-orders/${buildQueryString(params)}`,
      providesTags: [{ type: 'DispatchOrder', id: 'LIST' }],
    }),

    getDispatchAssignments: builder.query<
      PaginatedResponse<DispatchFreightAssignment>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/dispatch-assignments/${buildQueryString(params)}`,
      providesTags: [{ type: 'DispatchAssignment', id: 'LIST' }],
    }),

    createDispatchBatch: builder.mutation<
      DispatchBatch,
      CreateDispatchBatchRequest
    >({
      query: (body) => ({
        url: 'freight/api/v1/dispatch-batches/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'DispatchBatch', id: 'LIST' }],
    }),

    addOrderToDispatchBatch: builder.mutation<
      DispatchOrder,
      { batchId: number | string; order: number }
    >({
      query: ({ batchId, order }) => ({
        url: `freight/api/v1/dispatch-batches/${batchId}/add-order/`,
        method: 'POST',
        body: { order },
      }),
      invalidatesTags: (_result, _error, { batchId }) => [
        { type: 'DispatchBatch', id: batchId },
        { type: 'DispatchBatch', id: 'LIST' },
        { type: 'DispatchOrder', id: 'LIST' },
      ],
    }),

    removeOrderFromDispatchBatch: builder.mutation<
      void,
      { dispatchOrderId: number | string; batchId: number | string }
    >({
      query: ({ dispatchOrderId }) => ({
        url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/remove/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { batchId, dispatchOrderId }) => [
        { type: 'DispatchBatch', id: batchId },
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    assignFreightCompany: builder.mutation<
      DispatchFreightAssignment,
      { dispatchOrderId: number | string } & AssignFreightRequest
    >({
      query: ({ dispatchOrderId, freight_company, payer }) => ({
        url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/assign-freight/`,
        method: 'POST',
        body: { freight_company, payer },
      }),
      invalidatesTags: (_result, _error, { dispatchOrderId }) => [
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchAssignment', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    makeDispatchBatchReady: builder.mutation<DispatchBatch, number | string>({
      query: (batchId) => ({
        url: `freight/api/v1/dispatch-batches/${batchId}/ready/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'DispatchBatch', id },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    assignDispatcher: builder.mutation<
      DispatchBatch,
      { batchId: number | string; dispatcher: number }
    >({
      query: ({ batchId, dispatcher }) => ({
        url: `freight/api/v1/dispatch-batches/${batchId}/assign-dispatcher/`,
        method: 'POST',
        body: { dispatcher },
      }),
      invalidatesTags: (_result, _error, { batchId }) => [
        { type: 'DispatchBatch', id: batchId },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    startDispatch: builder.mutation<DispatchBatch, number | string>({
      query: (batchId) => ({
        url: `freight/api/v1/dispatch-batches/${batchId}/start/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'DispatchBatch', id },
        { type: 'DispatchBatch', id: 'LIST' },
        { type: 'DispatchOrder', id: 'LIST' },
      ],
    }),

    markDispatchOrderDelivered: builder.mutation<
      DispatchFreightAssignment,
      { dispatchOrderId: number | string; data: DispatchDeliveredRequest }
    >({
      query: ({ dispatchOrderId, data }) => {
        if (data.freight_invoice_file) {
          const body = new FormData();
          body.append('freight_invoice_number', data.freight_invoice_number);
          body.append('freight_invoice_file', data.freight_invoice_file);
          if (data.notes) body.append('notes', data.notes);

          return {
            url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/delivered/`,
            method: 'POST',
            body,
          };
        }

        return {
          url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/delivered/`,
          method: 'POST',
          body: {
            freight_invoice_number: data.freight_invoice_number,
            notes: data.notes ?? '',
          },
        };
      },
      invalidatesTags: (_result, _error, { dispatchOrderId }) => [
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchAssignment', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    approveDispatchHandover: builder.mutation<
      DispatchOrder,
      { dispatchOrderId: number | string } & DispatchActionRequest
    >({
      query: ({ dispatchOrderId, notes }) => ({
        url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/approve/`,
        method: 'POST',
        body: { notes: notes ?? '' },
      }),
      invalidatesTags: (_result, _error, { dispatchOrderId }) => [
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    rejectDispatchOrder: builder.mutation<
      DispatchOrder,
      { dispatchOrderId: number | string } & DispatchRejectRequest
    >({
      query: ({ dispatchOrderId, reason, notes }) => ({
        url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/reject/`,
        method: 'POST',
        body: { reason, notes: notes ?? '' },
      }),
      invalidatesTags: (_result, _error, { dispatchOrderId }) => [
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    returnDispatchOrder: builder.mutation<
      DispatchOrder,
      { dispatchOrderId: number | string } & DispatchActionRequest
    >({
      query: ({ dispatchOrderId, notes }) => ({
        url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/return/`,
        method: 'POST',
        body: { notes: notes ?? '' },
      }),
      invalidatesTags: (_result, _error, { dispatchOrderId }) => [
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    completeDispatchBatch: builder.mutation<DispatchBatch, number | string>({
      query: (batchId) => ({
        url: `freight/api/v1/dispatch-batches/${batchId}/complete/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'DispatchBatch', id },
        { type: 'DispatchBatch', id: 'LIST' },
        { type: 'DispatchOrder', id: 'LIST' },
      ],
    }),

    cancelDispatchBatch: builder.mutation<
      DispatchBatch,
      { batchId: number | string } & DispatchActionRequest
    >({
      query: ({ batchId, notes }) => ({
        url: `freight/api/v1/dispatch-batches/${batchId}/cancel/`,
        method: 'POST',
        body: { notes: notes ?? '' },
      }),
      invalidatesTags: (_result, _error, { batchId }) => [
        { type: 'DispatchBatch', id: batchId },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    cancelDispatchOrder: builder.mutation<
      DispatchOrder,
      { dispatchOrderId: number | string } & DispatchActionRequest
    >({
      query: ({ dispatchOrderId, notes }) => ({
        url: `freight/api/v1/dispatch-orders/${dispatchOrderId}/cancel/`,
        method: 'POST',
        body: { notes: notes ?? '' },
      }),
      invalidatesTags: (_result, _error, { dispatchOrderId }) => [
        { type: 'DispatchOrder', id: dispatchOrderId },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),

    cancelDispatchAssignment: builder.mutation<
      DispatchFreightAssignment,
      { assignmentId: number | string } & DispatchActionRequest
    >({
      query: ({ assignmentId, notes }) => ({
        url: `freight/api/v1/dispatch-assignments/${assignmentId}/cancel/`,
        method: 'POST',
        body: { notes: notes ?? '' },
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: 'DispatchAssignment', id: assignmentId },
        { type: 'DispatchAssignment', id: 'LIST' },
        { type: 'DispatchOrder', id: 'LIST' },
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetDispatchBatchesQuery,
  useGetDispatchBatchByIdQuery,
  useGetDispatchOrdersQuery,
  useGetDispatchAssignmentsQuery,
  useCreateDispatchBatchMutation,
  useAddOrderToDispatchBatchMutation,
  useRemoveOrderFromDispatchBatchMutation,
  useAssignFreightCompanyMutation,
  useMakeDispatchBatchReadyMutation,
  useAssignDispatcherMutation,
  useStartDispatchMutation,
  useMarkDispatchOrderDeliveredMutation,
  useApproveDispatchHandoverMutation,
  useRejectDispatchOrderMutation,
  useReturnDispatchOrderMutation,
  useCompleteDispatchBatchMutation,
  useCancelDispatchBatchMutation,
  useCancelDispatchOrderMutation,
  useCancelDispatchAssignmentMutation,
} = dispatchApi;