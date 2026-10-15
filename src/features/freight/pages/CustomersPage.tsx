import React, { useEffect, useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import { useGetCustomersQuery } from 'features/freight/api/customerApi';
import { Customer } from 'features/freight/types/customer';

const CustomersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetCustomersQuery({
    page: page + 1,
    page_size: pageSize,
  });

  useEffect(() => {
    if (!isError || !error || page === 0) {
      return;
    }

    const apiError = getApiError(error);

    if (apiError.code === 'INVALID_PAGE') {
      setPage((currentPage) => Math.max(0, currentPage - 1));
    }
  }, [isError, error, page]);

  const columns = [
    {
      key: 'id',
      header: 'شناسه',
      align: 'right' as const,
      width: 70,
    },
    {
      key: 'display_name',
      header: 'نام مشتری',
      align: 'right' as const,
    },
    {
      key: 'mobile',
      header: 'شماره موبایل',
      align: 'right' as const,
    },
    {
      key: 'customer_type',
      header: 'نوع مشتری',
      align: 'right' as const,
    },
    {
      key: 'national_id',
      header: 'کد ملی',
      align: 'right' as const,
      render: (customer: Customer) => customer.national_id || '—',
    },
    {
      key: 'company_registration_no',
      header: 'شماره ثبت شرکت',
      align: 'right' as const,
      render: (customer: Customer) =>
        customer.company_registration_no || '—',
    },
    {
      key: 'created_at',
      header: 'تاریخ ایجاد',
      align: 'right' as const,
      render: (customer: Customer) => {
        if (!customer.created_at) {
          return '—';
        }

        const date = new Date(customer.created_at);

        return Number.isNaN(date.getTime())
          ? '—'
          : date.toLocaleDateString('fa-IR');
      },
    },
  ];

  if (isError) {
    const apiError = getApiError(error);

    return (
      <div dir="rtl">
        <Typography variant="h4" sx={{ mb: 2 }}>
          مشتریان
        </Typography>

        <Typography color="error">
          {apiError.message}
        </Typography>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Stack spacing={3}>
        <Typography variant="h4">
          مشتریان
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              تعداد مشتریان: {data?.count ?? 0}
            </Typography>

            <DataTable<Customer>
              rows={data?.results ?? []}
              columns={columns}
              getRowId={(customer) => customer.id}
              loading={isLoading || isFetching}
              emptyMessage="مشتری‌ای وجود ندارد."
              pagination={{
                page,
                pageSize,
                total: data?.count ?? 0,
                pageSizeOptions: [10, 20, 50],
                onPageChange: setPage,
                onPageSizeChange: (newPageSize) => {
                  setPageSize(newPageSize);
                  setPage(0);
                },
              }}
            />
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default CustomersPage;