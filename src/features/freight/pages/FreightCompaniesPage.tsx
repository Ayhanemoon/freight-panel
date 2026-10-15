import React, { useEffect, useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import { useGetFreightCompaniesQuery } from 'features/freight/api/freightCompanyApi';
import { FreightCompany } from 'features/freight/types/freightCompany';

const FreightCompaniesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetFreightCompaniesQuery({
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
      key: 'name',
      header: 'نام شرکت حمل‌ونقل',
      align: 'right' as const,
    },
    {
      key: 'code',
      header: 'کد شرکت',
      align: 'right' as const,
    },
    {
      key: 'contact_phone',
      header: 'شماره تماس',
      align: 'right' as const,
    },
    {
      key: 'website',
      header: 'وب‌سایت',
      align: 'right' as const,
      render: (company: FreightCompany) => company.website || '—',
      truncate: true,
    },
    {
      key: 'is_active',
      header: 'وضعیت',
      align: 'center' as const,
      render: (company: FreightCompany) =>
        company.is_active ? 'فعال' : 'غیرفعال',
    },
    {
      key: 'created_at',
      header: 'تاریخ ایجاد',
      align: 'right' as const,
      render: (company: FreightCompany) => {
        if (!company.created_at) {
          return '—';
        }

        const date = new Date(company.created_at);

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
          شرکت‌های حمل‌ونقل
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
          شرکت‌های حمل‌ونقل
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              تعداد شرکت‌ها: {data?.count ?? 0}
            </Typography>

            <DataTable<FreightCompany>
              rows={data?.results ?? []}
              columns={columns}
              getRowId={(company) => company.id}
              loading={isLoading || isFetching}
              emptyMessage="شرکت حمل‌ونقلی ثبت نشده است."
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

export default FreightCompaniesPage;