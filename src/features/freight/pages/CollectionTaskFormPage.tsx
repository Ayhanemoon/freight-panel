
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';
import { crudMessages } from 'shared/feedback/crudMessages';

import {
  useCurrentUserCapabilities,
} from 'features/accounts/context/CurrentUserContext';
import {
  useCreateCollectionTaskMutation,
} from 'features/freight/api/collectionTaskApi';
import {
  useGetShipmentOrdersQuery,
} from 'features/freight/api/shipmentOrderApi';
import {
  canCreateCollectionTasks,
} from 'features/freight/permissions/collectionTaskAccess';
import {
  CollectionTaskType,
} from 'features/freight/types/collectionTask';

const taskTypeOptions: {
  value: CollectionTaskType;
  label: string;
}[] = [
  {
    value: 'customer_delivery',
    label: 'تحویل توسط مشتری',
  },
  {
    value: 'collector_pickup',
    label: 'جمع‌آوری از مشتری',
  },
];

const CollectionTaskFormPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useCurrentUserCapabilities();

  const canCreate = canCreateCollectionTasks(user);

  const [orderId, setOrderId] = useState('');
  const [taskType, setTaskType] =
    useState<CollectionTaskType>('collector_pickup');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useGetShipmentOrdersQuery(
    {
      page: 1,
      page_size: 100,
    },
    {
      skip: !canCreate,
    }
  );

  const [
    createCollectionTask,
    { isLoading: isCreating },
  ] = useCreateCollectionTaskMutation();

  const eligibleOrders = useMemo(
    () =>
      (ordersData?.results ?? []).filter(
        (order) =>
          order.status === 'approved_for_collection'
      ),
    [ordersData]
  );

  useEffect(() => {
    if (!isOrdersError || !ordersError) return;

    notifyError(getApiError(ordersError).message);
  }, [isOrdersError, ordersError]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!canCreate) {
      notifyError('شما مجوز ایجاد وظیفه جمع‌آوری را ندارید.');
      return;
    }

    if (!orderId) {
      notifyError('انتخاب سفارش الزامی است.');
      return;
    }

    try {
      const created = await createCollectionTask({
        order: Number(orderId),
        task_type: taskType,
        scheduled_at: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null,
        notes: notes.trim(),
      }).unwrap();

      notifySuccess(crudMessages.created('وظیفه جمع‌آوری'));

      navigate(
        `/dashboard/collection-tasks/${created.id}`
      );
    } catch (error) {
      const apiError = getApiError(error);

      const fieldMessages = Object.values(
        apiError.fieldErrors
      )
        .flat()
        .filter(Boolean);

      notifyError(
        fieldMessages.length
          ? `${apiError.message} ${fieldMessages.join(' ')}`
          : apiError.message
      );
    }
  };

  if (!canCreate) {
    return (
      <Stack spacing={2} dir="rtl">
        <Typography variant="h4">
          ایجاد وظیفه جمع‌آوری
        </Typography>

        <Alert severity="error">
          شما مجوز ایجاد وظیفه جمع‌آوری را ندارید.
        </Alert>

        <Button
          variant="outlined"
          onClick={() =>
            navigate('/dashboard/collection-tasks')
          }
        >
          بازگشت به فهرست وظایف
        </Button>
      </Stack>
    );
  }

  if (isOrdersLoading) {
    return (
      <Stack
        alignItems="center"
        spacing={2}
        sx={{ p: 4 }}
        dir="rtl"
      >
        <CircularProgress />
        <Typography>
          در حال دریافت سفارش‌ها...
        </Typography>
      </Stack>
    );
  }

  if (isOrdersError) {
    return null;
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
          ایجاد وظیفه جمع‌آوری
        </Typography>

        <Button
          variant="outlined"
          onClick={() =>
            navigate('/dashboard/collection-tasks')
          }
        >
          انصراف
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack
          component="form"
          spacing={3}
          onSubmit={handleSubmit}
        >
          <Typography variant="body2" color="text.secondary">
            سفارش موردنظر را انتخاب کنید و اطلاعات وظیفه
            جمع‌آوری را وارد کنید. تخصیص جمع‌آورنده از صفحه
            جزئیات وظیفه انجام خواهد شد.
          </Typography>

          <FormControl fullWidth required>
            <InputLabel id="collection-task-order-label">
              سفارش
            </InputLabel>

            <Select
              labelId="collection-task-order-label"
              value={orderId}
              label="سفارش"
              onChange={(event) =>
                setOrderId(event.target.value)
              }
              required
            >
              {eligibleOrders.map((order) => (
                <MenuItem
                  key={order.id}
                  value={String(order.id)}
                >
                  {order.tracking_code} — سفارش #{order.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {eligibleOrders.length === 0 && (
            <Alert severity="info">
              در حال حاضر سفارشی با وضعیت «تأییدشده برای
              جمع‌آوری» در فهرست دریافتی وجود ندارد.
            </Alert>
          )}

          <FormControl fullWidth required>
            <InputLabel id="collection-task-type-label">
              نوع وظیفه
            </InputLabel>

            <Select
              labelId="collection-task-type-label"
              value={taskType}
              label="نوع وظیفه"
              onChange={(event) =>
                setTaskType(
                  event.target.value as CollectionTaskType
                )
              }
              required
            >
              {taskTypeOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="زمان برنامه‌ریزی‌شده"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) =>
              setScheduledAt(event.target.value)
            }
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="توضیحات"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <Stack
            direction="row"
            justifyContent="flex-start"
            gap={2}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={
                isCreating ||
                !orderId ||
                eligibleOrders.length === 0
              }
            >
              {isCreating
                ? 'در حال ایجاد...'
                : 'ایجاد وظیفه'}
            </Button>

            <Button
              variant="outlined"
              disabled={isCreating}
              onClick={() =>
                navigate('/dashboard/collection-tasks')
              }
            >
              انصراف
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default CollectionTaskFormPage;
