
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  useCreateInvoiceChargeMutation,
  useUpdateInvoiceChargeMutation,
  useDeleteInvoiceChargeMutation,
} from 'features/freight/api/invoiceApi';
import { useGetShipmentOrderByIdQuery } from 'features/freight/api/shipmentOrderApi';
import type {
  Invoice,
  InvoiceCharge,
  InvoiceChargeInput,
  UpdateInvoiceRequest,
} from 'features/freight/types/invoice';
import InvoiceEditDialog from 'features/freight/components/InvoiceEditDialog';
import InvoiceChargeDialog from 'features/freight/components/InvoiceChargeDialog';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import {
  notifySuccess,
  notifyError,
} from 'shared/feedback/notification';
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

const formatMoney = (
  value: string | number | null | undefined,
): string => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return '—';

  return convertToPersianDigits(
    new Intl.NumberFormat('fa-IR').format(amount),
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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetInvoiceByIdQuery(id ?? '', {
    skip: !id,
  });

  const {
    data: order,
    isLoading: isOrderLoading,
    isFetching: isOrderFetching,
    isError: isOrderError,
  } = useGetShipmentOrderByIdQuery(invoice?.order ?? '', {
    skip: !invoice,
  });

  const [
    updateInvoice,
    { isLoading: isUpdatingInvoice },
  ] = useUpdateInvoiceMutation();

  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
  const [chargeToEdit, setChargeToEdit] = useState<InvoiceCharge | null>(null);
  const [chargeToDelete, setChargeToDelete] = useState<InvoiceCharge | null>(null);

  const [createInvoiceCharge, { isLoading: isCreatingCharge }] =
    useCreateInvoiceChargeMutation();

  const [updateInvoiceCharge, { isLoading: isUpdatingCharge }] =
    useUpdateInvoiceChargeMutation();

  const [deleteInvoiceCharge, { isLoading: isDeletingCharge }] =
    useDeleteInvoiceChargeMutation();

  const isSavingCharge = isCreatingCharge || isUpdatingCharge;

  // Invoice editing is available only before dispatch preparation.
  // The backend must enforce this restriction independently.
  const canEditInvoice =
    !isOrderLoading &&
    !isOrderFetching &&
    !isOrderError &&
    order?.status === 'invoice_registered';

  const handleUpdateInvoice = async (
    data: UpdateInvoiceRequest,
  ) => {
    if (!invoice || !canEditInvoice) {
      notifyError(
        'ویرایش صورتحساب در وضعیت فعلی سفارش امکان‌پذیر نیست.',
      );
      return;
    }

    try {
      await updateInvoice({
        id: invoice.id,
        data,
      }).unwrap();

      notifySuccess('صورتحساب با موفقیت ویرایش شد.');
      setIsEditDialogOpen(false);
    } catch (updateError) {
      notifyError(getApiError(updateError).message);
    }
  };

  const handleOpenAddCharge = () => {
    setChargeToEdit(null);
    setIsChargeDialogOpen(true);
  };

  const handleOpenEditCharge = (charge: InvoiceCharge) => {
    setChargeToEdit(charge);
    setIsChargeDialogOpen(true);
  };

  const handleCloseChargeDialog = () => {
    if (isSavingCharge) return;

    setIsChargeDialogOpen(false);
    setChargeToEdit(null);
  };

  const handleSaveCharge = async (data: InvoiceChargeInput) => {
    if (!invoice || !canEditInvoice) {
      notifyError('ویرایش هزینه در وضعیت فعلی سفارش امکان‌پذیر نیست.');
      return;
    }

    try {
      if (chargeToEdit) {
        await updateInvoiceCharge({
          invoiceId: invoice.id,
          orderId: invoice.order,
          chargeId: chargeToEdit.id,
          data,
        }).unwrap();

        notifySuccess('هزینه با موفقیت ویرایش شد.');
      } else {
        await createInvoiceCharge({
          invoiceId: invoice.id,
          orderId: invoice.order,
          data,
        }).unwrap();

        notifySuccess('هزینه با موفقیت اضافه شد.');
      }

      setIsChargeDialogOpen(false);
      setChargeToEdit(null);
    } catch (chargeError) {
      notifyError(getApiError(chargeError).message);
    }
  };

  const handleDeleteCharge = async () => {
    if (!invoice || !chargeToDelete || !canEditInvoice) {
      notifyError('حذف هزینه در وضعیت فعلی سفارش امکان‌پذیر نیست.');
      return;
    }

    try {
      await deleteInvoiceCharge({
        invoiceId: invoice.id,
        orderId: invoice.order,
        chargeId: chargeToDelete.id,
      }).unwrap();

      notifySuccess('هزینه با موفقیت حذف شد.');
      setChargeToDelete(null);
    } catch (chargeError) {
      notifyError(getApiError(chargeError).message);
    }
  };

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
        <Typography>
          در حال دریافت اطلاعات صورتحساب...
        </Typography>
      </Stack>
    );
  }

  if (isError || !invoice) {
    return (
      <Stack dir="rtl" spacing={2}>
        <Typography variant="h4">
          جزئیات صورتحساب
        </Typography>

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
        <Typography variant="h4">
          جزئیات صورتحساب
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowForwardOutlinedIcon />}
            onClick={() => navigate('/dashboard/invoices')}
          >
            بازگشت به فهرست
          </Button>

          {canEditInvoice && (
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setIsEditDialogOpen(true)}
            >
              ویرایش صورتحساب
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            onClick={() =>
              navigate(`/invoices/${invoice.id}/print`)
            }
          >
            چاپ صورتحساب
          </Button>
        </Stack>
      </Stack>

      {isOrderError && (
        <Alert severity="warning">
          وضعیت سفارش دریافت نشد؛ امکان ویرایش صورتحساب تا زمان
          دریافت وضعیت سفارش غیرفعال است.
        </Alert>
      )}

      {!isOrderLoading &&
        !isOrderFetching &&
        !isOrderError &&
        order &&
        order.status !== 'invoice_registered' && (
          <Alert severity="info">
            ویرایش صورتحساب پس از آماده‌شدن سفارش برای ارسال
            امکان‌پذیر نیست.
          </Alert>
        )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            اطلاعات صورتحساب
          </Typography>

          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            flexWrap="wrap"
            gap={3}
          >
            <DetailItem
              label="شماره صورتحساب"
              value={convertToPersianDigits(
                invoice.invoice_number,
              )}
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
          <Typography variant="h6">
            مشخصات فرستنده
          </Typography>

          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            flexWrap="wrap"
            gap={3}
          >
            <DetailItem
              label="نام"
              value={invoice.customer_name}
            />

            <DetailItem
              label="موبایل"
              value={invoice.customer_mobile}
            />

            <DetailItem
              label="آدرس"
              value={invoice.customer_address}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            مشخصات گیرنده
          </Typography>

          <Divider />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            flexWrap="wrap"
            gap={3}
          >
            <DetailItem
              label="نام"
              value={invoice.receiver_name}
            />

            <DetailItem
              label="موبایل"
              value={invoice.receiver_mobile}
            />

            <DetailItem
              label="آدرس"
              value={invoice.receiver_address}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            بسته‌های صورتحساب
          </Typography>

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h6">ریز هزینه‌ها</Typography>

          {canEditInvoice && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddCharge}
            >
              افزودن هزینه
            </Button>
          )}
        </Stack>

        <DataTable<Invoice['charges'][number]>
          rows={invoice.charges}
          columns={[
            {
              key: 'charge_type',
              header: 'عنوان هزینه',
              render: (charge) =>
                chargeLabels[charge.charge_type] ?? charge.charge_type,
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
          actions={
            canEditInvoice
              ? [
                  {
                    key: 'edit',
                    label: 'ویرایش هزینه',
                    icon: <EditIcon fontSize="small" />,
                    disabled: () => isSavingCharge || isDeletingCharge,
                    onClick: handleOpenEditCharge,
                  },
                  {
                    key: 'delete',
                    label: 'حذف هزینه',
                    icon: <DeleteIcon fontSize="small" />,
                    disabled: () => isSavingCharge || isDeletingCharge,
                    onClick: (charge) => setChargeToDelete(charge),
                  },
                ]
              : []
          }
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h6">
            توضیحات
          </Typography>

          <Divider />

          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {invoice.notes || 'توضیحاتی ثبت نشده است.'}
          </Typography>
        </Stack>
      </Paper>

      <InvoiceEditDialog
        open={isEditDialogOpen && canEditInvoice}
        invoice={invoice}
        isSubmitting={isUpdatingInvoice}
        onClose={() => {
          if (!isUpdatingInvoice) {
            setIsEditDialogOpen(false);
          }
        }}
        onSubmit={handleUpdateInvoice}
      />

      <InvoiceChargeDialog
        open={isChargeDialogOpen && canEditInvoice}
        charge={chargeToEdit}
        isSubmitting={isSavingCharge}
        onClose={handleCloseChargeDialog}
        onSubmit={handleSaveCharge}
      />

      <Dialog
        open={Boolean(chargeToDelete) && canEditInvoice}
        onClose={() => {
          if (!isDeletingCharge) setChargeToDelete(null);
        }}
        dir="rtl"
      >
        <DialogTitle>حذف ردیف هزینه</DialogTitle>

        <DialogContent>
          <DialogContentText>
            آیا از حذف این ردیف هزینه با مبلغ{' '}
            <strong>{formatMoney(chargeToDelete?.amount)}</strong> ریال
            مطمئن هستید؟
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setChargeToDelete(null)}
            disabled={isDeletingCharge}
            color="inherit"
          >
            انصراف
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCharge}
            disabled={isDeletingCharge}
          >
            {isDeletingCharge ? 'در حال حذف...' : 'حذف هزینه'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default InvoiceDetailPage;
