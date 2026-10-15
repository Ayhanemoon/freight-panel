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
  }),
});

export const {
  useGetShipmentOrdersQuery,
  useGetShipmentOrderByIdQuery,
  useGetShipmentOrderStatusHistoryQuery,
  useSubmitShipmentOrderMutation,
  useCreateShipmentOrderMutation,
  useUpdateShipmentOrderMutation,
} = shipmentOrderApi;