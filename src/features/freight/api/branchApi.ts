import baseApi from 'shared/api/baseApi';
import { PaginatedResponse } from 'shared/types/api';
import { Branch } from 'features/freight/types/branch';

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<PaginatedResponse<Branch>, void>({
      query: () => 'freight/api/v1/branches/',
    }),
  }),
});

export const {
  useGetBranchesQuery,
} = branchApi;