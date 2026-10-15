import React, { useEffect, useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import { useGetShipmentOrdersQuery } from 'features/freight/api/shipmentOrderApi';
import { ShipmentOrder } from 'features/freight/types/shipmentOrder';

const statusLabels: Record<ShipmentOrder['status'], string> = {
  draft: 'پیش‌نویس',
  submitted: 'ثبت‌شده',
  operator_review: 'در حال بررسی اپراتور',
  approved_for_collection: 'آماده دریافت',
  collected: 'جمع‌آوری‌شده',
  received_at_branch: 'دریافت‌شده در شعبه',
  invoice_registered: 'صورتحساب ثبت‌شده',
  ready_for_dispatch: 'آماده ارسال',
  dispatched_to_freight: 'تحویل شرکت حمل‌ونقل',
  handover_pending_approval: 'در انتظار تأیید تحویل',
  handover_approved: 'تحویل تأییدشده',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
  rejected: 'ردشده',
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('fa-IR');
};

const ShipmentOrdersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetShipmentOrdersQuery({
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
      key: 'tracking_code',
      header: 'کد رهگیری',
      align: 'right' as const,
      render: (order: ShipmentOrder) => order.tracking_code || '—',
    },
    {
      key: 'barcode',
      header: 'بارکد',
      align: 'right' as const,
      render: (order: ShipmentOrder) => order.barcode || '—',
    },
    {
      key: 'sender_name',
      header: 'فرستنده',
      align: 'right' as const,
    },
    {
      key: 'receiver_name',
      header: 'گیرنده',
      align: 'right' as const,
    },
    {
      key: 'status',
      header: 'وضعیت',
      align: 'center' as const,
      render: (order: ShipmentOrder) =>
        statusLabels[order.status] ?? order.status,
    },
    {
      key: 'created_at',
      header: 'تاریخ ایجاد',
      align: 'right' as const,
      render: (order: ShipmentOrder) => formatDate(order.created_at),
    },
  ];

  if (isError) {
    const apiError = getApiError(error);

    return (
      <div dir="rtl">
        <Typography variant="h4" sx={{ mb: 2 }}>
          سفارش‌های ارسال
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
          سفارش‌های ارسال
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              تعداد سفارش‌ها: {data?.count ?? 0}
            </Typography>

            <DataTable<ShipmentOrder>
              rows={data?.results ?? []}
              columns={columns}
              getRowId={(order) => order.id}
              loading={isLoading || isFetching}
              emptyMessage="سفارشی ثبت نشده است."
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

export default ShipmentOrdersPage;