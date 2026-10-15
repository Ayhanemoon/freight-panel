import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import { FreightCompany } from 'features/freight/types/freightCompany';

export const freightCompanyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFreightCompanies: builder.query<
      PaginatedResponse<FreightCompany>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/freight-companies/${buildQueryString(params)}`,
    }),
  }),
});

export const {
  useGetFreightCompaniesQuery,
} = freightCompanyApi;