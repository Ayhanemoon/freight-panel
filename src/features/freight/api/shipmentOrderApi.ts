import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
  import { ShipmentOrder, ShipmentOrderDetail } from 'features/freight/types/shipmentOrder';
  import { ShipmentStatusHistory } from 'features/freight/types/shipmentStatusHistory';

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
  }),
});

export const {
  useGetShipmentOrdersQuery,
  useGetShipmentOrderByIdQuery,
  useGetShipmentOrderStatusHistoryQuery,
} = shipmentOrderApi;