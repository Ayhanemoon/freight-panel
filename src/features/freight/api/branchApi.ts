import baseApi from 'shared/api/baseApi';
import {
  buildQueryString,
  ListQueryParams,
} from 'shared/api/queryParams';
import { PaginatedResponse } from 'shared/types/api';
import { Branch } from 'features/freight/types/branch';

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<
      PaginatedResponse<Branch>,
      ListQueryParams | void
    >({
      query: (params) =>
        `freight/api/v1/branches/${buildQueryString(params)}`,
    }),
  }),
});

export const { useGetBranchesQuery } = branchApi;