import baseApi from 'shared/api/baseApi';
import { PaginatedResponse } from 'shared/types/api';
import { CustomerBranchMembership } from
  'features/freight/types/customerBranchMembership';

export const customerBranchMembershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentCustomerActiveMemberships: builder.query<
      PaginatedResponse<CustomerBranchMembership>,
      void
    >({
      query: () =>
        'freight/api/v1/customer-branch-memberships/active/',
    }),
  }),
});

export const {
  useGetCurrentCustomerActiveMembershipsQuery,
} = customerBranchMembershipApi;