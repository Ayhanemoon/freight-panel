
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

import { useGetInvoiceByIdQuery } from 'features/freight/api/invoiceApi';
import { Invoice } from 'features/freight/types/invoice';
import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import { convertToPersianDigits } from 'shared/utils/number';

const chargeLabels: Record<string, string> = {
  freight: 'کرایه حمل',
  insurance: 'بیمه',
  crane_loading: 'بارگیری / جرثقیل',
  branch: 'هزینه شعبه',
  other: 'سایر هزینه‌ها',
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fa-IR');
};

const formatMoney = (value: string | number | null | undefined): string => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return '—';

  return convertToPersianDigits(
    new Intl.NumberFormat('fa-IR').format(amount)
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <Stack spacing={0.5}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ overflowWrap: 'anywhere' }}>
      {value === null || value === undefined || value === ''
        ? '—'
        : value}
    </Typography>
  </Stack>
);

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetInvoiceByIdQuery(id ?? '', { skip: !id });

  if (isLoading || isFetching) {
    return (
      <Stack
        dir="rtl"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ py: 8 }}
      >
        <CircularProgress />
        <Typography>در حال دریافت اطلاعات صورتحساب...</Typography>
      </Stack>
    );
  }

  if (isError || !invoice) {
    return (
      <Stack dir="rtl" spacing={2}>
        <Typography variant="h4">جزئیات صورتحساب</Typography>
        <Alert severity="error">
          {isError
            ? getApiError(error).message
            : 'صورتحساب موردنظر پیدا نشد.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowForwardOutlinedIcon />}
          onClick={() => navigate('/dashboard/invoices')}
          sx={{ alignSelf: 'flex-start' }}
        >
          بازگشت به صورتحساب‌ها
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} dir="rtl">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">جزئیات صورتحساب</Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowForwardOutlinedIcon />}
            onClick={() => navigate('/dashboard/invoices')}
          >
            بازگشت به فهرست
          </Button>

          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => navigate(`/invoices/${invoice.id}/print`)}
          >
            چاپ صورتحساب
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">اطلاعات صورتحساب</Typography>
          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            flexWrap="wrap"
            gap={3}
          >
            <DetailItem
              label="شماره صورتحساب"
              value={convertToPersianDigits(invoice.invoice_number)}
            />
            <DetailItem
              label="شناسه سفارش"
              value={convertToPersianDigits(invoice.order)}
            />
            <DetailItem
              label="تاریخ صدور"
              value={formatDate(invoice.issued_at)}
            />
            <DetailItem
              label="شناسه اپراتور"
              value={convertToPersianDigits(invoice.operator)}
            />
            <DetailItem
              label="مبلغ کل (ریال)"
              value={formatMoney(invoice.total_cost)}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">مشخصات فرستنده</Typography>
          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            flexWrap="wrap"
            gap={3}
          >
            <DetailItem label="نام" value={invoice.customer_name} />
            <DetailItem label="موبایل" value={invoice.customer_mobile} />
            <DetailItem label="آدرس" value={invoice.customer_address} />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">مشخصات گیرنده</Typography>
          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            flexWrap="wrap"
            gap={3}
          >
            <DetailItem label="نام" value={invoice.receiver_name} />
            <DetailItem label="موبایل" value={invoice.receiver_mobile} />
            <DetailItem label="آدرس" value={invoice.receiver_address} />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">بسته‌های صورتحساب</Typography>

          <DataTable<Invoice['parcels'][number]>
            rows={invoice.parcels}
            columns={[
              {
                key: 'parcel_number',
                header: 'شماره بسته',
                render: (parcel) =>
                  convertToPersianDigits(parcel.parcel_number),
              },
              {
                key: 'parcel_name',
                header: 'شرح بسته',
                render: (parcel) => parcel.parcel_name || '—',
              },
              {
                key: 'parcel_type',
                header: 'نوع بسته',
                render: (parcel) => parcel.parcel_type || '—',
              },
              {
                key: 'quantity',
                header: 'تعداد',
                render: (parcel) =>
                  convertToPersianDigits(parcel.quantity),
              },
            ]}
            getRowId={(parcel) => parcel.id}
            emptyMessage="بسته‌ای برای این صورتحساب ثبت نشده است."
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">ریز هزینه‌ها</Typography>

          <DataTable<Invoice['charges'][number]>
            rows={invoice.charges}
            columns={[
              {
                key: 'charge_type',
                header: 'عنوان هزینه',
                render: (charge) =>
                  chargeLabels[charge.charge_type] ??
                  charge.charge_type,
              },
              {
                key: 'description',
                header: 'شرح',
                render: (charge) => charge.description || '—',
              },
              {
                key: 'payer',
                header: 'پرداخت‌کننده',
                render: (charge) =>
                  charge.payer === 'sender'
                    ? 'فرستنده'
                    : charge.payer === 'receiver'
                      ? 'گیرنده'
                      : '—',
              },
              {
                key: 'amount',
                header: 'مبلغ (ریال)',
                render: (charge) => formatMoney(charge.amount),
              },
            ]}
            getRowId={(charge) => charge.id}
            emptyMessage="هزینه‌ای برای این صورتحساب ثبت نشده است."
          />

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
          >
            <Typography fontWeight={700}>مبلغ کل (ریال)</Typography>
            <Typography fontWeight={800} variant="h6">
              {formatMoney(invoice.total_cost)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {invoice.notes && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6">توضیحات</Typography>
            <Divider />
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {invoice.notes}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default InvoiceDetailPage;
