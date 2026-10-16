
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

export interface DeleteParcelArgs {
  id: number | string;
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
      providesTags: (_result, _error, { order }) => [
        { type: 'Parcel', id: `ORDER-${order}` },
        { type: 'Parcel', id: 'LIST' },
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
        { type: 'Parcel', id: 'LIST' },
      ],
    }),

    updateParcel: builder.mutation<Parcel, UpdateParcelArgs>({
      query: ({ id, data }) => ({
        url: `freight/api/v1/parcels/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, _error, { id, data }) => {
        const order = result?.order ?? data.order;

        return [
          { type: 'Parcel', id },
          { type: 'Parcel', id: 'LIST' },
          ...(order !== undefined
            ? [{ type: 'Parcel' as const, id: `ORDER-${order}` }]
            : []),
        ];
      },
    }),

    deleteParcel: builder.mutation<void, DeleteParcelArgs>({
      query: ({ id }) => ({
        url: `freight/api/v1/parcels/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, order }) => [
        { type: 'Parcel', id },
        { type: 'Parcel', id: 'LIST' },
        { type: 'Parcel', id: `ORDER-${order}` },
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
