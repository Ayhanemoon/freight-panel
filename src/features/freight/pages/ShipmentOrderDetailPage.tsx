import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { getApiError } from 'shared/api/apiError';
import {
  useGetShipmentOrderByIdQuery,
  useGetShipmentOrderStatusHistoryQuery,
} from 'features/freight/api/shipmentOrderApi';
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
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fa-IR');
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
  } = useGetShipmentOrderByIdQuery(id ?? '', {
    skip: !id,
  });

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useGetShipmentOrderStatusHistoryQuery(id ?? '', {
    skip: !id || !order,
  });

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

          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/shipment-orders')}
          >
            بازگشت به سفارش‌ها
          </Button>
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

            <DetailItem label="شناسه شعبه" value={order.branch} />
            <DetailItem label="شناسه مشتری" value={order.customer} />
            <DetailItem
              label="شناسه شرکت حمل‌ونقل ترجیحی"
              value={order.preferred_freight_company}
            />
            <DetailItem
              label="شرح محموله"
              value={order.shipment_description}
            />
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
          <Stack spacing={1}>
            <Typography variant="h6">
              بسته‌ها
            </Typography>

            <Typography color="text.secondary">
              نمایش بسته‌های این سفارش در مرحله بعد، پس از فراهم شدن
              فیلتر معتبر بر اساس شناسه سفارش، اضافه می‌شود.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default ShipmentOrderDetailPage;