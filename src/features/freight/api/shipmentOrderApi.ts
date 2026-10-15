import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import { ShipmentOrder } from 'features/freight/types/shipmentOrder';

export const shipmentOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShipmentOrders: builder.query<
      PaginatedResponse<ShipmentOrder>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/shipment-orders/${buildQueryString(params)}`,
    }),
  }),
});

export const {
  useGetShipmentOrdersQuery,
} = shipmentOrderApi;