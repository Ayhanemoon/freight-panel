import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import { ShipmentOrder, ShipmentOrderDetail } from 'features/freight/types/shipmentOrder';
import { ShipmentStatusHistory } from 'features/freight/types/shipmentStatusHistory';

export interface ShipmentOrderWriteRequest {
  branch: number;
  customer?: number;
  preferred_freight_company?: number | null;
  sender_name: string;
  sender_mobile: string;
  sender_address: string;
  receiver_name: string;
  receiver_mobile: string;
  receiver_address: string;
  shipment_description?: string;
}

export interface UpdateShipmentOrderArgs {
  id: number | string;
  data: Partial<ShipmentOrderWriteRequest>;
}

export interface ShipmentOrderActionRequest {
  note?: string;
}

export interface RejectShipmentOrderRequest {
  reason: string;
}


export const shipmentOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShipmentOrders: builder.query<
      PaginatedResponse<ShipmentOrder>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/shipment-orders/${buildQueryString(params)}`,
    }),

    getShipmentOrderById: builder.query<ShipmentOrderDetail, number | string>({
      query: (id) => `freight/api/v1/shipment-orders/${id}/`,
    }),

    getShipmentOrderStatusHistory: builder.query<
      ShipmentStatusHistory[],
      number | string
    >({
      query: (id) =>
        `freight/api/v1/shipment-orders/${id}/status-history/`,
    }),
    submitShipmentOrder: builder.mutation<
      ShipmentOrderDetail,
      number | string
    >({
      query: (id) => ({
        url: `freight/api/v1/shipment-orders/${id}/submit/`,
        method: 'POST',
      }),
    }),
    createShipmentOrder: builder.mutation<
      ShipmentOrderDetail,
      ShipmentOrderWriteRequest
    >({
      query: (body) => ({
        url: 'freight/api/v1/shipment-orders/',
        method: 'POST',
        body,
      }),
    }),

    updateShipmentOrder: builder.mutation<
      ShipmentOrderDetail,
      UpdateShipmentOrderArgs
    >({
      query: ({ id, data }) => ({
        url: `freight/api/v1/shipment-orders/${id}/`,
        method: 'PATCH',
        body: data,
      }),
    }),

    startShipmentOrderReview: builder.mutation<
      ShipmentOrderDetail,
      { id: number | string } & ShipmentOrderActionRequest
    >({
      query: ({ id, note }) => ({
        url: `freight/api/v1/shipment-orders/${id}/start-review/`,
        method: 'POST',
        body: note?.trim() ? { note: note.trim() } : {},
      }),
    }),

    approveShipmentOrderForCollection: builder.mutation<
      ShipmentOrderDetail,
      { id: number | string } & ShipmentOrderActionRequest
    >({
      query: ({ id, note }) => ({
        url: `freight/api/v1/shipment-orders/${id}/approve-collection/`,
        method: 'POST',
        body: note?.trim() ? { note: note.trim() } : {},
      }),
    }),

    rejectShipmentOrder: builder.mutation<
      ShipmentOrderDetail,
      { id: number | string } & RejectShipmentOrderRequest
    >({
      query: ({ id, reason }) => ({
        url: `freight/api/v1/shipment-orders/${id}/reject/`,
        method: 'POST',
        body: { reason: reason.trim() },
      }),
    }),

    cancelShipmentOrder: builder.mutation<
      ShipmentOrderDetail,
      { id: number | string } & ShipmentOrderActionRequest
    >({
      query: ({ id, note }) => ({
        url: `freight/api/v1/shipment-orders/${id}/cancel/`,
        method: 'POST',
        body: note?.trim() ? { note: note.trim() } : {},
      }),
    }),

    receiveShipmentOrderAtBranch: builder.mutation<
      ShipmentOrderDetail,
      { id: number | string } & ShipmentOrderActionRequest
    >({
      query: ({ id, note }) => ({
        url: `freight/api/v1/shipment-orders/${id}/receive-at-branch/`,
        method: 'POST',
        body: note?.trim() ? { note: note.trim() } : {},
      }),
    }),
    markShipmentOrderReadyForDispatch: builder.mutation<
      ShipmentOrderDetail,
      number | string
    >({
      query: (id) => ({
        url: `freight/api/v1/shipment-orders/${id}/ready-for-dispatch/`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'DispatchBatch', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetShipmentOrdersQuery,
  useGetShipmentOrderByIdQuery,
  useGetShipmentOrderStatusHistoryQuery,
  useSubmitShipmentOrderMutation,
  useCreateShipmentOrderMutation,
  useUpdateShipmentOrderMutation,
  useStartShipmentOrderReviewMutation,
  useApproveShipmentOrderForCollectionMutation,
  useRejectShipmentOrderMutation,
  useCancelShipmentOrderMutation,
  useReceiveShipmentOrderAtBranchMutation,
  useMarkShipmentOrderReadyForDispatchMutation
} = shipmentOrderApi;