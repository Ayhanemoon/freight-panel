
import { useEffect, useState } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { useNavigate } from 'react-router-dom';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import { notifyError } from 'shared/feedback/notification';
import { useGetInvoicesQuery } from 'features/freight/api/invoiceApi';
import { Invoice } from 'features/freight/types/invoice';
import { convertToPersianDigits } from 'shared/utils/number';

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('fa-IR');
};

const formatMoney = (value: string | number | null | undefined): string => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return '—';

  return convertToPersianDigits(
    new Intl.NumberFormat('fa-IR').format(amount)
  );
};

const InvoicesPage = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetInvoicesQuery({
    page: page + 1,
    page_size: pageSize,
  });

  useEffect(() => {
    if (!isError || !error) return;

    const apiError = getApiError(error);

    if (apiError.code === 'INVALID_PAGE' && page > 0) {
      setPage((currentPage) => Math.max(0, currentPage - 1));
      return;
    }

    notifyError(apiError.message);
  }, [isError, error, page]);

  const columns = [
    {
      key: 'invoice_number',
      header: 'شماره صورتحساب',
      render: (invoice: Invoice) =>
        convertToPersianDigits(invoice.invoice_number || '—'),
    },
    {
      key: 'order',
      header: 'شناسه سفارش',
      render: (invoice: Invoice) =>
        convertToPersianDigits(invoice.order),
    },
    {
      key: 'customer_name',
      header: 'فرستنده',
      render: (invoice: Invoice) => invoice.customer_name || '—',
    },
    {
      key: 'receiver_name',
      header: 'گیرنده',
      render: (invoice: Invoice) => invoice.receiver_name || '—',
    },
    {
      key: 'total_cost',
      header: 'مبلغ کل (ریال)',
      render: (invoice: Invoice) => formatMoney(invoice.total_cost),
    },
    {
      key: 'issued_at',
      header: 'تاریخ صدور',
      render: (invoice: Invoice) => formatDate(invoice.issued_at),
    },
  ];

  return (
    <Stack spacing={3} dir="rtl">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">صورتحساب‌ها</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            تعداد صورتحساب‌ها: {data?.count ?? 0}
          </Typography>

          <DataTable<Invoice>
            rows={data?.results ?? []}
            columns={columns}
            getRowId={(invoice) => invoice.id}
            loading={isLoading || isFetching}
            emptyMessage="صورتحسابی ثبت نشده است."
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
            actions={[
              {
                key: 'view',
                label: 'مشاهده جزئیات',
                icon: <VisibilityOutlinedIcon />,
                onClick: (invoice) =>
                  navigate(`/dashboard/invoices/${invoice.id}`),
              },
              {
                key: 'print',
                label: 'چاپ صورتحساب',
                icon: <PrintOutlinedIcon />,
                onClick: (invoice) =>
                  navigate(`/invoices/${invoice.id}/print`),
              },
            ]}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default InvoicesPage;
