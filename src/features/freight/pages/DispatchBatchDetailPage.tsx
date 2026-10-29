
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
} from 'features/freight/api/dispatchApi';
import { useGetShipmentOrdersQuery } from 'features/freight/api/shipmentOrderApi';
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

            <TextField
              select
              fullWidth
              label="سفارش"
              value={selectedOrderId}
              onChange={(event) => setSelectedOrderId(event.target.value)}
              disabled={shipmentOrdersLoading || isAdding}
              helperText={
                eligibleOrders.length
                  ? 'فقط سفارش‌های آماده ارسال نمایش داده می‌شوند.'
                  : 'سفارش آماده ارسالِ قابل افزودنی وجود ندارد.'
              }
            >
              {eligibleOrders.map((order: ShipmentOrder) => (
                <MenuItem key={order.id} value={String(order.id)}>
                  {order.tracking_code || `سفارش ${order.id}`}
                  {' — '}
                  {order.sender_name} ← {order.receiver_name}
                </MenuItem>
              ))}
            </TextField>

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
              batch.status === 'draft'
                ? [
                    {
                      key: 'remove',
                      label: 'حذف از دسته',
                      icon: <DeleteOutlineIcon />,
                      onClick: handleRemoveOrder,
                    },
                  ]
                : []
            }
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default DispatchBatchDetailPage;
