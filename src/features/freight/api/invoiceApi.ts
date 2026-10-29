
import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';

import type {
  Invoice,
  InvoiceCharge,
  InvoiceChargeInput,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from 'features/freight/types/invoice';

interface InvoiceChargeMutationArgs {
  invoiceId: number | string;
  orderId: number | string;
  chargeId?: number | string;
  data?: InvoiceChargeInput;
}

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

    getInvoiceForOrder: builder.query<Invoice, number | string>({
      query: (orderId) =>
        `freight/api/v1/shipment-orders/${orderId}/invoice/`,
      providesTags: (result, _error, orderId) => [
        { type: 'Invoice', id: `ORDER-${orderId}` },
        ...(result ? [{ type: 'Invoice' as const, id: result.id }] : []),
      ],
    }),

    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({
        url: 'freight/api/v1/invoices/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: 'Invoice', id: 'LIST' },
        { type: 'Invoice', id: `ORDER-${body.order}` },
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

    createInvoiceCharge: builder.mutation<
      InvoiceCharge,
      InvoiceChargeMutationArgs & { data: InvoiceChargeInput }
    >({
      query: ({ invoiceId, data }) => ({
        url: `freight/api/v1/invoices/${invoiceId}/charges/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { invoiceId, orderId }) => [
        { type: 'Invoice', id: invoiceId },
        { type: 'Invoice', id: `ORDER-${orderId}` },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    updateInvoiceCharge: builder.mutation<
      InvoiceCharge,
      InvoiceChargeMutationArgs & {
        chargeId: number | string;
        data: Partial<InvoiceChargeInput>;
      }
    >({
      query: ({ invoiceId, chargeId, data }) => ({
        url: `freight/api/v1/invoices/${invoiceId}/charges/${chargeId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { invoiceId, orderId }) => [
        { type: 'Invoice', id: invoiceId },
        { type: 'Invoice', id: `ORDER-${orderId}` },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    deleteInvoiceCharge: builder.mutation<
      void,
      InvoiceChargeMutationArgs & { chargeId: number | string }
    >({
      query: ({ invoiceId, chargeId }) => ({
        url: `freight/api/v1/invoices/${invoiceId}/charges/${chargeId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { invoiceId, orderId }) => [
        { type: 'Invoice', id: invoiceId },
        { type: 'Invoice', id: `ORDER-${orderId}` },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoiceForOrderQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useCreateInvoiceChargeMutation,
  useUpdateInvoiceChargeMutation,
  useDeleteInvoiceChargeMutation,
} = invoiceApi;
