
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import Autocomplete, {
  createFilterOptions,
} from '@mui/material/Autocomplete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';
import {
  useAddOrderToDispatchBatchMutation,
  useGetDispatchBatchByIdQuery,
  useRemoveOrderFromDispatchBatchMutation,
  useAssignFreightCompanyMutation,
  useMakeDispatchBatchReadyMutation,
} from 'features/freight/api/dispatchApi';
import { useGetShipmentOrdersQuery } from 'features/freight/api/shipmentOrderApi';
import { useGetFreightCompaniesQuery } from 'features/freight/api/freightCompanyApi';
import { DispatchOrder } from 'features/freight/types/dispatch';
import { ShipmentOrder } from 'features/freight/types/shipmentOrder';
import { convertToPersianDigits } from 'shared/utils/number';

const statusLabels: Record<string, string> = {
  draft: 'پیش‌نویس',
  ready: 'آماده ارسال',
  assigned: 'مسئول ارسال تعیین‌شده',
  in_progress: 'در حال ارسال',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
  pending: 'در انتظار ارسال',
  delivered: 'تحویل‌شده',
  rejected: 'ردشده',
  returned: 'برگشت‌خورده',
};

const shipmentOrderFilter = createFilterOptions<ShipmentOrder>({
  stringify: (order) =>
    [
      order.tracking_code,
      order.id,
      order.sender_name,
      order.receiver_name,
    ].join(' '),
});

const DispatchBatchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedOrderId, setSelectedOrderId] = useState('');

  const {
    data: batch,
    isLoading,
    isError,
    error,
  } = useGetDispatchBatchByIdQuery(id ?? '', { skip: !id });

  const {
    data: shipmentOrdersData,
    isLoading: shipmentOrdersLoading,
  } = useGetShipmentOrdersQuery({ page_size: 100 });

  const [addOrder, { isLoading: isAdding }] =
    useAddOrderToDispatchBatchMutation();

  const [removeOrder, { isLoading: isRemoving }] =
    useRemoveOrderFromDispatchBatchMutation();

  useEffect(() => {
    if (isError && error) {
      notifyError(getApiError(error).message);
    }
  }, [isError, error]);

  const existingOrderIds = new Set(
    (batch?.orders ?? []).map((item) => item.order)
  );

  const eligibleOrders = (shipmentOrdersData?.results ?? []).filter(
    (order) =>
      order.status === 'ready_for_dispatch' &&
      !existingOrderIds.has(order.id)
  );

  const hasOrders = batch?.orders.length
    ? batch.orders.length > 0
    : false;

  const allOrdersHaveFreightAssignment =
    hasOrders &&
    batch!.orders.every((item) =>
      item.freight_assignments?.some(
        (assignment) => assignment.status === 'dispatching'
      )
    );

  const canMakeBatchReady =
    batch?.status === 'draft' &&
    allOrdersHaveFreightAssignment;

  const [assignmentOrder, setAssignmentOrder] =
    useState<DispatchOrder | null>(null);

  const [freightCompanyId, setFreightCompanyId] = useState('');
  const [payer, setPayer] = useState<'sender' | 'receiver'>('sender');

  const { data: freightCompaniesData, isLoading: freightCompaniesLoading } = useGetFreightCompaniesQuery({ page_size: 100 });

  const [assignFreightCompany, { isLoading: isAssigningFreight }] = useAssignFreightCompanyMutation();

  const [makeBatchReady, { isLoading: isMakingReady }] = useMakeDispatchBatchReadyMutation();

  const handleAddOrder = async () => {
    if (!id || !selectedOrderId) {
      notifyError('لطفاً سفارش را انتخاب کنید.');
      return;
    }

    try {
      await addOrder({
        batchId: id,
        order: Number(selectedOrderId),
      }).unwrap();

      notifySuccess('سفارش به دسته ارسال اضافه شد.');
      setSelectedOrderId('');
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const handleRemoveOrder = async (item: DispatchOrder) => {
    if (!id) return;

    try {
      await removeOrder({
        batchId: id,
        dispatchOrderId: item.id,
      }).unwrap();

      notifySuccess('سفارش از دسته ارسال حذف شد.');
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const handleAssignFreightCompany = async () => {
    if (!assignmentOrder || !freightCompanyId) {
      notifyError('لطفاً شرکت حمل‌ونقل را انتخاب کنید.');
      return;
    }

    try {
      await assignFreightCompany({
        batchId: id!,
        dispatchOrderId: assignmentOrder.id,
        freight_company: Number(freightCompanyId),
        payer,
      }).unwrap();

      notifySuccess('شرکت حمل‌ونقل با موفقیت تخصیص داده شد.');
      setAssignmentOrder(null);
      setFreightCompanyId('');
      setPayer('sender');
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const handleMakeBatchReady = async () => {
    if (!batch || !canMakeBatchReady) {
      notifyError(
        'برای آماده‌سازی، دسته باید حداقل یک سفارش داشته باشد و برای تمام سفارش‌ها شرکت حمل‌ونقل تخصیص داده شده باشد.'
      );
      return;
    }

    try {
      await makeBatchReady(batch.id).unwrap();

      notifySuccess('دسته ارسال با موفقیت آماده شد.');
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const columns = [
    {
      key: 'order',
      header: 'شناسه سفارش',
      render: (item: DispatchOrder) =>
        convertToPersianDigits(item.order),
    },
    {
      key: 'status',
      header: 'وضعیت ارسال',
      render: (item: DispatchOrder) =>
        statusLabels[item.status] ?? item.status,
    },
    {
      key: 'freight_assignments',
      header: 'تعداد تخصیص حمل',
      render: (item: DispatchOrder) =>
        convertToPersianDigits(item.freight_assignments?.length ?? 0),
    },
  ];

  if (isLoading) {
    return (
      <Stack dir="rtl" spacing={2}>
        <Typography>در حال بارگذاری اطلاعات دسته ارسال...</Typography>
      </Stack>
    );
  }

  if (isError || !batch) {
    return (
      <Stack dir="rtl" spacing={2}>
        <Typography color="error">
          اطلاعات دسته ارسال قابل دریافت نیست.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/dispatch-batches')}
        >
          بازگشت به فهرست
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
          جزئیات دسته ارسال {convertToPersianDigits(batch.id)}
        </Typography>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/dispatch-batches')}
        >
          بازگشت به فهرست
        </Button>
      </Stack>

      {batch.status === 'draft' && (
        <Stack spacing={1} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMakeBatchReady}
            disabled={!canMakeBatchReady || isMakingReady}
          >
            {isMakingReady
              ? 'در حال آماده‌سازی...'
              : 'آماده‌سازی دسته ارسال'}
          </Button>

          {!hasOrders && (
            <Typography variant="caption" color="text.secondary">
              ابتدا حداقل یک سفارش به دسته اضافه کنید.
            </Typography>
          )}

          {hasOrders && !allOrdersHaveFreightAssignment && (
            <Typography variant="caption" color="text.secondary">
              برای تمام سفارش‌های این دسته باید شرکت حمل‌ونقل تخصیص داده شود.
            </Typography>
          )}
        </Stack>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography>
            **وضعیت:** {statusLabels[batch.status] ?? batch.status}
          </Typography>
          <Typography>
            **شناسه شعبه:** {convertToPersianDigits(batch.branch)}
          </Typography>
          <Typography>
            **تعداد سفارش‌ها:** {convertToPersianDigits(batch.orders.length)}
          </Typography>
          <Typography>
            **توضیحات:** {batch.notes || '—'}
          </Typography>
          <Typography>
            **زمان برنامه‌ریزی‌شده:** {batch.scheduled_at
              ? new Date(batch.scheduled_at).toLocaleString('fa-IR')
              : '—'}
          </Typography>
        </Stack>
      </Paper>

      {batch.status === 'draft' && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">افزودن سفارش آماده ارسال</Typography>

            <Autocomplete<ShipmentOrder>
              fullWidth
              options={eligibleOrders}
              value={
                eligibleOrders.find(
                  (order) => String(order.id) === selectedOrderId
                ) ?? null
              }
              loading={shipmentOrdersLoading}
              disabled={
                shipmentOrdersLoading ||
                isAdding ||
                eligibleOrders.length === 0
              }
              filterOptions={shipmentOrderFilter}
              getOptionLabel={(order) =>
                `${order.tracking_code || `سفارش ${order.id}`} — ${order.sender_name} ← ${order.receiver_name}`
              }
              isOptionEqualToValue={(option, value) =>
                option.id === value.id
              }
              noOptionsText={
                eligibleOrders.length
                  ? 'سفارشی با عبارت جست‌وجوشده پیدا نشد.'
                  : 'هیچ سفارش آماده ارسالی برای افزودن وجود ندارد.'
              }
              loadingText="در حال دریافت سفارش‌ها..."
              onChange={(_, newValue) => {
                setSelectedOrderId(
                  newValue ? String(newValue.id) : ''
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="جست‌وجو و انتخاب سفارش"
                  placeholder="کد رهگیری، شناسه، فرستنده یا گیرنده..."
                  helperText={
                    eligibleOrders.length
                      ? 'فقط سفارش‌های آماده ارسال که هنوز در این دسته نیستند نمایش داده می‌شوند.'
                      : 'در حال حاضر سفارشی برای افزودن وجود ندارد.'
                  }
                />
              )}
              renderOption={(props, order) => (
                <li {...props} key={order.id}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      {order.tracking_code || `سفارش ${order.id}`}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {order.sender_name} ← {order.receiver_name}
                    </Typography>
                  </Stack>
                </li>
              )}
            />

            <Stack direction="row" justifyContent="flex-start">
              <Button
                variant="contained"
                onClick={handleAddOrder}
                disabled={
                  !selectedOrderId ||
                  isAdding ||
                  shipmentOrdersLoading
                }
              >
                {isAdding ? 'در حال افزودن...' : 'افزودن سفارش'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">سفارش‌های این دسته</Typography>

          <DataTable<DispatchOrder>
            rows={batch.orders}
            columns={columns}
            getRowId={(item) => item.id}
            loading={isRemoving}
            emptyMessage="هنوز سفارشی به این دسته اضافه نشده است."
            actions={
              batch.status === 'draft' || batch.status === 'in_progress'
                ? [
                    {
                      key: 'assign-freight',
                      label: 'تخصیص شرکت حمل‌ونقل',
                      icon: <AssignmentTurnedInIcon />,
                      onClick: (item: DispatchOrder) => {
                        const hasActiveAssignment = item.freight_assignments?.some(
                          (assignment) => assignment.status === 'dispatching'
                        );

                        if (hasActiveAssignment) {
                          notifyError('این سفارش از قبل تخصیص فعال دارد.');
                          return;
                        }

                        setAssignmentOrder(item);
                        setFreightCompanyId('');
                        setPayer('sender');
                      },
                      hidden: (item: DispatchOrder) =>
                        !['pending', 'in_progress'].includes(item.status) ||
                        item.freight_assignments?.some(
                          (assignment) => assignment.status === 'dispatching'
                        ),
                    },
                    ...(batch.status === 'draft'
                      ? [{
                          key: 'remove',
                          label: 'حذف از دسته',
                          icon: <DeleteOutlineIcon />,
                          onClick: handleRemoveOrder,
                        }]
                      : []),
                  ]
                : []
            }
          />
        </Stack>
      </Paper>
      <Dialog
        open={Boolean(assignmentOrder)}
        onClose={() => {
          if (!isAssigningFreight) {
            setAssignmentOrder(null);
          }
        }}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle>تخصیص شرکت حمل‌ونقل</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              required
              label="شرکت حمل‌ونقل"
              value={freightCompanyId}
              onChange={(event) => setFreightCompanyId(event.target.value)}
              disabled={freightCompaniesLoading || isAssigningFreight}
            >
              {(freightCompaniesData?.results ?? [])
                .filter((company) => company.is_active)
                .map((company) => (
                  <MenuItem key={company.id} value={String(company.id)}>
                    {company.name} — {company.code}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="پرداخت‌کننده هزینه"
              value={payer}
              onChange={(event) =>
                setPayer(event.target.value as 'sender' | 'receiver')
              }
              disabled={isAssigningFreight}
            >
              <MenuItem value="sender">فرستنده</MenuItem>
              <MenuItem value="receiver">گیرنده</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setAssignmentOrder(null)}
            disabled={isAssigningFreight}
          >
            انصراف
          </Button>

          <Button
            variant="contained"
            onClick={handleAssignFreightCompany}
            disabled={
              !freightCompanyId ||
              freightCompaniesLoading ||
              isAssigningFreight
            }
          >
            {isAssigningFreight ? 'در حال تخصیص...' : 'ثبت تخصیص'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DispatchBatchDetailPage;
