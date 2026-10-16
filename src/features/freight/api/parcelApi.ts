
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

export interface ParcelWriteRequest {
  order: number | string;
  parcel_number: number;
  declared_weight_kg?: string | null;
  declared_length_cm?: string | null;
  declared_width_cm?: string | null;
  declared_height_cm?: string | null;
  contents_description?: string;
}

export interface UpdateParcelArgs {
  id: number | string;
  data: Partial<ParcelWriteRequest>;
}

export const parcelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getParcels: builder.query<
      PaginatedResponse<Parcel>,
      ParcelListParams
    >({
      query: (params) =>
        `freight/api/v1/parcels/${buildQueryString(params)}`,
      providesTags: (_result, _error, { order }) => [
        { type: 'Parcel', id: `ORDER-${order}` },
      ],
    }),

    createParcel: builder.mutation<Parcel, ParcelWriteRequest>({
      query: (body) => ({
        url: 'freight/api/v1/parcels/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { order }) => [
        { type: 'Parcel', id: `ORDER-${order}` },
      ],
    }),

    updateParcel: builder.mutation<Parcel, UpdateParcelArgs>({
      query: ({ id, data }) => ({
        url: `freight/api/v1/parcels/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, data }) => [
        ...(data.order !== undefined
          ? [{ type: 'Parcel' as const, id: `ORDER-${data.order}` }]
          : []),
        { type: 'Parcel' as const, id },
        { type: 'Parcel' as const, id: 'LIST' },
      ],
    }),

    deleteParcel: builder.mutation<void, number | string>({
      query: (id) => ({
        url: `freight/api/v1/parcels/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Parcel', id },
        { type: 'Parcel', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetParcelsQuery,
  useCreateParcelMutation,
  useUpdateParcelMutation,
  useDeleteParcelMutation,
} = parcelApi;
