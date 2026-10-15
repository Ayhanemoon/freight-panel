import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import { Customer } from 'features/freight/types/customer';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<
      PaginatedResponse<Customer>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/customers/${buildQueryString(params)}`,
    }),
  }),
});

export const {
  useGetCustomersQuery,
} = customerApi;