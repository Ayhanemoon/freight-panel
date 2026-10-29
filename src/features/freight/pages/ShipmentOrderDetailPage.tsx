import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import {
  notifySuccess,
  notifyError,
} from 'shared/feedback/notification';
import { convertToPersianDigits } from 'shared/utils/number';
import { crudMessages } from 'shared/feedback/crudMessages';
import {
  useGetShipmentOrderByIdQuery,
  useGetShipmentOrderStatusHistoryQuery,
  useSubmitShipmentOrderMutation,
  useStartShipmentOrderReviewMutation,
  useApproveShipmentOrderForCollectionMutation,
  useRejectShipmentOrderMutation,
  useCancelShipmentOrderMutation,
  useReceiveShipmentOrderAtBranchMutation,
  useMarkShipmentOrderReadyForDispatchMutation,
} from 'features/freight/api/shipmentOrderApi';
import {
  useGetParcelsQuery,
  useCreateParcelMutation,
  useUpdateParcelMutation,
  useDeleteParcelMutation,
  ParcelWriteRequest,
} from 'features/freight/api/parcelApi';
import ParcelFormDialog from 'features/freight/components/ParcelFormDialog';
import { useCreateInvoiceMutation, useGetInvoiceForOrderQuery } from 'features/freight/api/invoiceApi';
import InvoiceRegistrationDialog from 'features/freight/components/InvoiceRegistrationDialog';
import { CreateInvoiceRequest } from 'features/freight/types/invoice';
import { ShipmentOrder } from 'features/freight/types/shipmentOrder';
import { Parcel } from 'features/freight/types/parcel';
import type { Invoice } from 'features/freight/types/invoice';

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

type ShipmentOrderWorkflowAction =
  | 'start-review'
  | 'approve-collection'
  | 'receive-at-branch'
  | 'ready-for-dispatch'
  | 'reject'
  | 'cancel'
  | null;

const formatDate = (value: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fa-IR');
};

const formatMoney = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return '—';

  return convertToPersianDigits(
    new Intl.NumberFormat('fa-IR').format(amount),
  );
};

const getStatusLabel = (status: string | null): string => {
  if (!status) return '—';

  return status in statusLabels
    ? statusLabels[status as ShipmentOrder['status']]
    : status;
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Stack spacing={0.5}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography>{value || '—'}</Typography>
  </Stack>
);

const ShipmentOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch: refetchOrder,
  } = useGetShipmentOrderByIdQuery(id ?? '', {
    skip: !id,
  });

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useGetShipmentOrderStatusHistoryQuery(id ?? '', {
    skip: !id || !order,
  });

  const [
    submitShipmentOrder,
    { isLoading: isSubmitting },
  ] = useSubmitShipmentOrderMutation();

  const [
    startShipmentOrderReview,
    { isLoading: isStartingReview },
  ] = useStartShipmentOrderReviewMutation();

  const [
    approveShipmentOrderForCollection,
    { isLoading: isApprovingCollection },
  ] = useApproveShipmentOrderForCollectionMutation();

  const [
    rejectShipmentOrder,
    { isLoading: isRejecting },
  ] = useRejectShipmentOrderMutation();

  const [
    cancelShipmentOrder,
    { isLoading: isCancelling },
  ] = useCancelShipmentOrderMutation();

  const [
    receiveShipmentOrderAtBranch,
    { isLoading: isReceivingAtBranch },
  ] = useReceiveShipmentOrderAtBranchMutation();

  const [
  markShipmentOrderReadyForDispatch,
  { isLoading: isMarkingReadyForDispatch },
] = useMarkShipmentOrderReadyForDispatchMutation();

  const {
    data: orderInvoice,
    isLoading: isInvoiceLoading,
    isFetching: isInvoiceFetching,
    isError: isInvoiceError,
    error: invoiceError,
  } = useGetInvoiceForOrderQuery(id ?? '', {
    skip: !id,
  });

  const invoiceLookupComplete = !isInvoiceLoading && !isInvoiceFetching;

  const invoiceNotFound =
    invoiceLookupComplete &&
    isInvoiceError &&
    getApiError(invoiceError).status === 404;

  const invoiceLookupFailed =
    invoiceLookupComplete &&
    isInvoiceError &&
    !invoiceNotFound;

  const [workflowAction, setWorkflowAction] =
    useState<ShipmentOrderWorkflowAction>(null);

  const [workflowNote, setWorkflowNote] = useState('');

  const isWorkflowActionLoading =
    isStartingReview ||
    isApprovingCollection ||
    isReceivingAtBranch ||
    isRejecting ||
    isCancelling ||
    isMarkingReadyForDispatch;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitOrder = async () => {
    if (!id) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await submitShipmentOrder(id).unwrap();

      await Promise.all([
        refetchOrder(),
        refetchHistory(),
      ]);

      setSubmitSuccess(true);
      notifySuccess('سفارش با موفقیت برای بررسی ارسال شد.')
    } catch (error) {
      const message = getApiError(error).message;
      setSubmitError(message);
      notifyError(message);
    }
  };

  const handleOpenWorkflowAction = (
    action: Exclude<ShipmentOrderWorkflowAction, null>
  ) => {
    setWorkflowAction(action);
    setWorkflowNote('');
  };

  const handleCloseWorkflowAction = () => {
    if (isWorkflowActionLoading) return;

    setWorkflowAction(null);
    setWorkflowNote('');
  };

  const handleSubmitWorkflowAction = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id || !workflowAction) return;

    if (workflowAction === 'reject' && !workflowNote.trim()) {
      notifyError('برای رد سفارش، ثبت دلیل الزامی است.');
      return;
    }

    try {
      switch (workflowAction) {
        case 'start-review':
          await startShipmentOrderReview({
            id,
            note: workflowNote,
          }).unwrap();

          notifySuccess('بررسی سفارش آغاز شد.');
          break;

        case 'approve-collection':
          await approveShipmentOrderForCollection({
            id,
            note: workflowNote,
          }).unwrap();

          notifySuccess('سفارش برای جمع‌آوری تأیید شد.');
          break;

        case 'reject':
          await rejectShipmentOrder({
            id,
            reason: workflowNote,
          }).unwrap();

          notifySuccess('سفارش رد شد.');
          break;

        case 'cancel':
          await cancelShipmentOrder({
            id,
            note: workflowNote,
          }).unwrap();

          notifySuccess('سفارش لغو شد.');
          break;
        
        case 'receive-at-branch':
          await receiveShipmentOrderAtBranch({
            id,
            note: workflowNote,
          }).unwrap();

          notifySuccess('دریافت سفارش در شعبه ثبت شد.');
          break;
        
        case 'ready-for-dispatch':
          await markShipmentOrderReadyForDispatch(id).unwrap();

          notifySuccess('سفارش با موفقیت برای ارسال آماده شد.');
          break;
      }

      setWorkflowAction(null);
      setWorkflowNote('');

      await Promise.all([
        refetchOrder(),
        refetchHistory(),
      ]);
    } catch (actionError) {
      notifyError(getApiError(actionError).message);
    }
  };

  const [parcelPage, setParcelPage] = useState(0);
  const [parcelPageSize, setParcelPageSize] = useState(10);

  const [createParcel, { isLoading: isCreatingParcel }] = useCreateParcelMutation();

  const [updateParcel, { isLoading: isUpdatingParcel }] = useUpdateParcelMutation();

  const [deleteParcel, { isLoading: isDeletingParcel }] = useDeleteParcelMutation();

  const [isParcelDialogOpen, setIsParcelDialogOpen] = useState(false);
  const [parcelToEdit, setParcelToEdit] = useState<Parcel | null>(null);
  const [parcelToDelete, setParcelToDelete] = useState<Parcel | null>(null);

  const isSavingParcel = isCreatingParcel || isUpdatingParcel;

  const {
    data: parcelsData,
    isLoading: areParcelsLoading,
    isFetching: areParcelsFetching,
    isError: areParcelsError,
    error: parcelsError,
  } = useGetParcelsQuery(
    {
      order: id ?? '',
      page: parcelPage + 1,
      page_size: parcelPageSize,
    },
    {
      skip: !id || !order,
    }
  );

  useEffect(() => {
    if (!areParcelsError || parcelPage === 0) {
      return;
    }

    const apiError = getApiError(parcelsError);

    if (apiError.code === 'INVALID_PAGE') {
      setParcelPage((currentPage) => Math.max(0, currentPage - 1));
    }
  }, [areParcelsError, parcelsError, parcelPage]);

  const handleOpenCreateParcel = () => {
    setParcelToEdit(null);
    setIsParcelDialogOpen(true);
  };

  const handleOpenEditParcel = (parcel: Parcel) => {
    setParcelToEdit(parcel);
    setIsParcelDialogOpen(true);
  };

  const handleCloseParcelDialog = () => {
    if (isSavingParcel) return;

    setIsParcelDialogOpen(false);
    setParcelToEdit(null);
  };

  const handleSaveParcel = async (
    data: ParcelWriteRequest
  ) => {
    try {
      if (parcelToEdit) {
        const { order: _order, ...patchData } = data;

        await updateParcel({
          id: parcelToEdit.id,
          data: patchData,
        }).unwrap();

        notifySuccess(crudMessages.updated('بسته'));
      } else {
        await createParcel(data).unwrap();

        setParcelPage(0);
        notifySuccess(crudMessages.created('بسته'));
      }

      setIsParcelDialogOpen(false);
      setParcelToEdit(null);
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const handleDeleteParcel = async () => {
    if (!parcelToDelete || !id) return;

    try {
      await deleteParcel({
        id: parcelToDelete.id,
        order: id,
      }).unwrap();

      setParcelToDelete(null);
      notifySuccess(crudMessages.deleted('بسته'));
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const parcelColumns = [
    {
      key: 'parcel_number',
      header: 'شماره بسته',
      align: 'right' as const,
      render: (parcel: Parcel) => parcel.parcel_number,
    },
    {
      key: 'contents_description',
      header: 'شرح محتویات',
      align: 'right' as const,
      render: (parcel: Parcel) => parcel.contents_description || '—',
    },
    {
      key: 'declared_weight_kg',
      header: 'وزن (کیلوگرم)',
      align: 'right' as const,
      render: (parcel: Parcel) => parcel.declared_weight_kg ?? '—',
    },
    {
      key: 'dimensions',
      header: 'ابعاد (سانتی‌متر)',
      align: 'right' as const,
      render: (parcel: Parcel) =>
        [
          parcel.declared_length_cm,
          parcel.declared_width_cm,
          parcel.declared_height_cm,
        ].every((value) => value === null)
          ? '—'
          : `${parcel.declared_length_cm ?? '—'} × ${
              parcel.declared_width_cm ?? '—'
            } × ${parcel.declared_height_cm ?? '—'}`,
    },
    {
      key: 'verification_status',
      header: 'وضعیت بررسی',
      align: 'center' as const,
      render: (parcel: Parcel) => {
        const labels: Record<string, string> = {
          pending: 'در انتظار بررسی',
          verified: 'تأییدشده',
          rejected: 'ردشده',
        };

        return labels[parcel.verification_status] ??
          parcel.verification_status;
      },
    },
  ];

  const parcelActions = [
    {
      key: 'edit',
      label: 'ویرایش بسته',
      icon: <EditIcon fontSize="small" />,
      hidden: () => order?.status !== 'draft',
      disabled: () => isSavingParcel || isDeletingParcel,
      onClick: (parcel: Parcel) => handleOpenEditParcel(parcel),
    },
    {
      key: 'delete',
      label: 'حذف بسته',
      icon: <DeleteIcon fontSize="small" />,
      hidden: () => order?.status !== 'draft',
      disabled: () => isSavingParcel || isDeletingParcel,
      onClick: (parcel: Parcel) => setParcelToDelete(parcel),
    },
  ];

  
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const [createInvoice, { isLoading: isCreatingInvoice }] =
    useCreateInvoiceMutation();

  const handleCreateInvoice = async (data: CreateInvoiceRequest) => {
    try {
      const invoice = await createInvoice(data).unwrap();

      notifySuccess('صورتحساب با موفقیت ثبت شد.');
      setIsInvoiceDialogOpen(false);

      await Promise.all([refetchOrder(), refetchHistory()]);

      navigate(`/invoices/${invoice.id}/print`);
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };


  if (isLoading) {
    return (
      <div dir="rtl">
        <Typography>در حال دریافت اطلاعات سفارش...</Typography>
      </div>
    );
  }

  if (isError || !order) {
    const message = isError
      ? getApiError(error).message
      : 'سفارش پیدا نشد.';

    return (
      <div dir="rtl">
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5">
            جزئیات سفارش ارسال
          </Typography>

          <Typography color="error">{message}</Typography>

          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/shipment-orders')}
          >
            بازگشت به سفارش‌ها
          </Button>
        </Stack>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4">
            جزئیات سفارش ارسال
          </Typography>

          <Stack  direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/shipment-orders')}
            >
              بازگشت به سفارش‌ها
            </Button>
            {order.status === 'draft' && (
              <Button
                variant="contained"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'در حال ارسال...'
                  : 'ارسال سفارش برای بررسی'}
              </Button>
            )}
            {order.status === 'submitted' && (
              <Button
                variant="contained"
                onClick={() => handleOpenWorkflowAction('start-review')}
                disabled={isWorkflowActionLoading}
              >
                شروع بررسی
              </Button>
            )}

            {order.status === 'invoice_registered' && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleOpenWorkflowAction('ready-for-dispatch')}
                disabled={isWorkflowActionLoading}
              >
                آماده‌سازی برای ارسال
              </Button>
            )}

            {order.status === 'collected' && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleOpenWorkflowAction('receive-at-branch')}
                disabled={isWorkflowActionLoading}
              >
                ثبت دریافت در شعبه
              </Button>
            )}

            {order.status === 'operator_review' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    handleOpenWorkflowAction('approve-collection')
                  }
                  disabled={isWorkflowActionLoading}
                >
                  تأیید برای جمع‌آوری
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleOpenWorkflowAction('reject')}
                  disabled={isWorkflowActionLoading}
                >
                  رد سفارش
                </Button>
              </>
            )}

            {[
              'draft',
              'submitted',
              'operator_review',
              'approved_for_collection',
              'collected',
              'received_at_branch',
              'invoice_registered',
              'ready_for_dispatch',
            ].includes(order.status) && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleOpenWorkflowAction('cancel')}
                disabled={isWorkflowActionLoading}
              >
                لغو سفارش
              </Button>
            )}
          </Stack>

        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              اطلاعات اصلی
            </Typography>

            <Divider />

            <DetailItem label="شناسه" value={order.id} />
            <DetailItem label="شناسه عمومی" value={order.public_id} />
            <DetailItem label="کد رهگیری" value={order.tracking_code} />
            <DetailItem label="بارکد" value={order.barcode} />
            <DetailItem
              label="وضعیت"
              value={getStatusLabel(order.status)}
            />
            <DetailItem
              label="تاریخ ثبت"
              value={formatDate(order.created_at)}
            />
            <DetailItem
              label="تاریخ ارسال برای بررسی"
              value={formatDate(order.submitted_at)}
            />
            <DetailItem
              label="آخرین به‌روزرسانی"
              value={formatDate(order.updated_at)}
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              اطلاعات فرستنده
            </Typography>

            <Divider />

            <DetailItem label="نام" value={order.sender_name} />
            <DetailItem label="شماره موبایل" value={order.sender_mobile} />
            <DetailItem label="آدرس" value={order.sender_address} />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              اطلاعات گیرنده
            </Typography>

            <Divider />

            <DetailItem label="نام" value={order.receiver_name} />
            <DetailItem label="شماره موبایل" value={order.receiver_mobile} />
            <DetailItem label="آدرس" value={order.receiver_address} />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              اطلاعات حمل‌ونقل
            </Typography>

            <Divider />

            <DetailItem
              label="شعبه"
              value={`${order.branch.name} (${order.branch.code})`}
            />

            <DetailItem
              label="مشتری"
              value={`${order.customer.display_name} - ${order.customer.mobile}`}
            />

            <DetailItem
              label="شرکت حمل‌ونقل ترجیحی"
              value={
                order.preferred_freight_company
                  ? `${order.preferred_freight_company.name} (${order.preferred_freight_company.code})`
                  : '—'
              }
            />

            <DetailItem
              label="شرح محموله"
              value={order.shipment_description}
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">صورتحساب و بیجک باربری</Typography>
            <Divider />

            {isInvoiceLoading || isInvoiceFetching ? (
              <Typography color="text.secondary">
                در حال بررسی صورتحساب سفارش...
              </Typography>
            ) : null}

            {invoiceLookupFailed && (
              <Alert severity="error">
                {getApiError(invoiceError).message}
              </Alert>
            )}

            {orderInvoice && (
              <>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  flexWrap="wrap"
                  gap={3}
                >
                  <DetailItem
                    label="شماره صورتحساب"
                    value={convertToPersianDigits(orderInvoice.invoice_number)}
                  />

                  <DetailItem
                    label="مبلغ کل (ریال)"
                    value={formatMoney(orderInvoice.total_cost)}
                  />

                  <DetailItem
                    label="تاریخ صدور"
                    value={formatDate(orderInvoice.issued_at)}
                  />
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() =>
                      navigate(`/dashboard/invoices/${orderInvoice.id}`)
                    }
                  >
                    مشاهده و ویرایش صورتحساب
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<PrintOutlinedIcon />}
                    onClick={() =>
                      navigate(`/invoices/${orderInvoice.id}/print`)
                    }
                  >
                    چاپ صورتحساب
                  </Button>
                </Stack>
              </>
            )}

            {!orderInvoice &&
              invoiceNotFound &&
              order.status === 'received_at_branch' && (
                <>
                  <Typography color="text.secondary">
                    هنوز صورتحسابی برای این سفارش ثبت نشده است.
                  </Typography>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setIsInvoiceDialogOpen(true)}
                  >
                    ثبت صورتحساب و بیجک
                  </Button>
                </>
              )}

            {!orderInvoice &&
              invoiceNotFound &&
              order.status !== 'received_at_branch' && (
                <Typography color="text.secondary">
                  برای این سفارش هنوز صورتحسابی ثبت نشده است.
                </Typography>
              )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              تاریخچه وضعیت سفارش
            </Typography>

            <Divider />

            {isHistoryLoading && (
              <Typography>
                در حال دریافت تاریخچه...
              </Typography>
            )}

            {isHistoryError && (
              <Typography color="error">
                {getApiError(historyError).message}
              </Typography>
            )}

            {!isHistoryLoading &&
              !isHistoryError &&
              (!history || history.length === 0) && (
                <Typography color="text.secondary">
                  تاریخچه‌ای برای این سفارش ثبت نشده است.
                </Typography>
              )}

            {history?.map((item) => (
              <Paper
                key={item.id}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Stack spacing={1}>
                  <Typography fontWeight={600}>
                    {getStatusLabel(item.from_status)} ←{' '}
                    {getStatusLabel(item.to_status)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    تاریخ: {formatDate(item.created_at)}
                  </Typography>

                  <Typography variant="body2">
                    شناسه کاربر تغییر‌دهنده: {item.changed_by ?? '—'}
                  </Typography>

                  <Typography>
                    توضیحات: {item.note || '—'}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="h6">
                بسته‌های سفارش
              </Typography>

              {order.status === 'draft' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateParcel}
                >
                  افزودن بسته
                </Button>
              )}
            </Stack>

            <Divider />

            {areParcelsError ? (
              <Typography color="error">
                {getApiError(parcelsError).message}
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  تعداد بسته‌ها: {parcelsData?.count ?? 0}
                </Typography>

                <DataTable<Parcel>
                  rows={parcelsData?.results ?? []}
                  columns={parcelColumns}
                  getRowId={(parcel) => parcel.id}
                  loading={areParcelsLoading || areParcelsFetching}
                  emptyMessage="بسته‌ای برای این سفارش ثبت نشده است."
                  pagination={{
                    page: parcelPage,
                    pageSize: parcelPageSize,
                    total: parcelsData?.count ?? 0,
                    pageSizeOptions: [10, 20, 50],
                    onPageChange: setParcelPage,
                    onPageSizeChange: (newPageSize) => {
                      setParcelPageSize(newPageSize);
                      setParcelPage(0);
                    },
                  }}
                  actions={order.status === 'draft' ? parcelActions : []}
                />
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
      <ParcelFormDialog
        open={isParcelDialogOpen}
        orderId={id ?? ''}
        parcel={parcelToEdit}
        isSubmitting={isSavingParcel}
        onClose={handleCloseParcelDialog}
        onSubmit={handleSaveParcel}
      />

      <Dialog
        open={Boolean(parcelToDelete)}
        onClose={() => {
          if (!isDeletingParcel) {
            setParcelToDelete(null);
          }
        }}
        dir="rtl"
      >
        <DialogTitle>حذف بسته</DialogTitle>

        <DialogContent>
          <DialogContentText>
            آیا از حذف بسته شماره{' '}
            <strong>{parcelToDelete?.parcel_number}</strong>{' '}
            مطمئن هستید؟
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setParcelToDelete(null)}
            disabled={isDeletingParcel}
          >
            انصراف
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteParcel}
            disabled={isDeletingParcel}
          >
            {isDeletingParcel ? 'در حال حذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={workflowAction !== null}
        onClose={handleCloseWorkflowAction}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <Stack
          component="form"
          onSubmit={handleSubmitWorkflowAction}
        >
          <DialogTitle>
            {workflowAction === 'start-review' &&
              'شروع بررسی سفارش'}

            {workflowAction === 'approve-collection' &&
              'تأیید سفارش برای جمع‌آوری'}

            {workflowAction === 'receive-at-branch' &&
              'ثبت دریافت سفارش در شعبه'}

            {workflowAction === 'ready-for-dispatch' &&
              'آماده‌سازی سفارش برای ارسال'}

            {workflowAction === 'reject' &&
              'رد سفارش'}

            {workflowAction === 'cancel' &&
              'لغو سفارش'}
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {workflowAction === 'start-review' &&
                'در صورت نیاز، توضیحی برای شروع بررسی ثبت کنید.'}

              {workflowAction === 'approve-collection' &&
                'در صورت نیاز، توضیحی برای تأیید سفارش ثبت کنید.'}

              {workflowAction === 'receive-at-branch' &&
                'پس از دریافت فیزیکی محموله در شعبه، این عملیات را ثبت کنید. در صورت نیاز توضیحی وارد کنید.'}

              {workflowAction === 'ready-for-dispatch' &&
                'پس از اطمینان از ثبت صورتحساب و آماده بودن محموله، وضعیت سفارش را به آماده ارسال تغییر دهید.'}

              {workflowAction === 'reject' &&
                'دلیل رد سفارش را وارد کنید. ثبت دلیل الزامی است.'}

              {workflowAction === 'cancel' &&
                'در صورت نیاز، دلیل لغو سفارش را وارد کنید.'}
            </DialogContentText>

            <TextField
              label={
                workflowAction === 'reject'
                  ? 'دلیل رد سفارش'
                  : 'توضیحات'
              }
              value={workflowNote}
              onChange={(event) => setWorkflowNote(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              required={workflowAction === 'reject'}
              inputProps={{ maxLength: 2000 }}
              disabled={isWorkflowActionLoading}
            />
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCloseWorkflowAction}
              disabled={isWorkflowActionLoading}
            >
              انصراف
            </Button>

            <Button
              type="submit"
              variant="contained"
              color={
                workflowAction === 'reject' ||
                workflowAction === 'cancel'
                  ? 'error'
                  : 'primary'
              }
              disabled={
                isWorkflowActionLoading ||
                (workflowAction === 'reject' &&
                  !workflowNote.trim())
              }
            >
              {isWorkflowActionLoading
                ? 'در حال ثبت...'
                : 'تأیید و ثبت'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
      
      <InvoiceRegistrationDialog
        open={isInvoiceDialogOpen}
        order={order}
        isSubmitting={isCreatingInvoice}
        onClose={() => {
          if (!isCreatingInvoice) {
            setIsInvoiceDialogOpen(false);
          }
        }}
        onSubmit={handleCreateInvoice}
      />

    </div>
  );
};

export default ShipmentOrderDetailPage;