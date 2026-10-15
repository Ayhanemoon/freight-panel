import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import { Parcel } from 'features/freight/types/parcel';

export interface ParcelListParams extends ListQueryParams {
  order: number | string;
}

export const parcelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getParcels: builder.query<
      PaginatedResponse<Parcel>,
      ParcelListParams
    >({
      query: (params) =>
        `freight/api/v1/parcels/${buildQueryString(params)}`,
    }),
  }),
});

export const { useGetParcelsQuery } = parcelApi;