
import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';

import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from 'features/freight/types/invoice';

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<
      PaginatedResponse<Invoice>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/invoices/${buildQueryString(params)}`,
      providesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),

    getInvoiceById: builder.query<Invoice, number | string>({
      query: (id) => `freight/api/v1/invoices/${id}/`,
      providesTags: (_result, _error, id) => [
        { type: 'Invoice', id },
      ],
    }),

    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({
        url: 'freight/api/v1/invoices/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    updateInvoice: builder.mutation<
      Invoice,
      { id: number | string; data: UpdateInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `freight/api/v1/invoices/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} = invoiceApi;
