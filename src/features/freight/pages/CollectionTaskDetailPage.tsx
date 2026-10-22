import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';

import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';

import {
  useAssignCollectionTaskMutation,
  useGetCollectionTaskByIdQuery,
} from 'features/freight/api/collectionTaskApi';

import {
  useCurrentUserCapabilities,
} from 'features/accounts/context/CurrentUserContext';

import {
  canAssignCollectionTasks,
  canViewCollectionTasks,
} from 'features/freight/permissions/collectionTaskAccess';

import {
  CollectionTask,
  CollectionTaskStatus,
  CollectionTaskType,
} from 'features/freight/types/collectionTask';

const statusLabels: Record<CollectionTaskStatus, string> = {
  pending: 'در انتظار تخصیص',
  assigned: 'تخصیص‌یافته',
  in_progress: 'در حال انجام',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
  failed: 'ناموفق',
};

const taskTypeLabels: Record<CollectionTaskType, string> = {
  customer_delivery: 'تحویل توسط مشتری',
  collector_pickup: 'جمع‌آوری از مشتری',
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fa-IR');
};

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
}) => (
  <Stack spacing={0.5}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>

    <Typography sx={{ overflowWrap: 'anywhere' }}>
      {value ?? '—'}
    </Typography>
  </Stack>
);

const CollectionTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useCurrentUserCapabilities();

  const canView = canViewCollectionTasks(user);
  const canAssign = canAssignCollectionTasks(user);

  const taskId = id && /^\d+$/.test(id) ? Number(id) : undefined;

  const {
    data: task,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCollectionTaskByIdQuery(taskId ?? '', {
    skip: !canView || taskId === undefined,
  });

  const [
    assignCollectionTask,
    { isLoading: isAssigning },
  ] = useAssignCollectionTaskMutation();

  const [collectorId, setCollectorId] = useState('');

  useEffect(() => {
    setCollectorId(
      task?.collector != null ? String(task.collector) : ''
    );
  }, [task?.id, task?.collector]);

  const handleAssign = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!task || !canAssign) {
      notifyError('شما مجوز تخصیص وظیفه جمع‌آوری را ندارید.');
      return;
    }

    const parsedCollectorId = Number(collectorId);

    if (
      !collectorId.trim() ||
      !Number.isInteger(parsedCollectorId) ||
      parsedCollectorId <= 0
    ) {
      notifyError('شناسه معتبر جمع‌آورنده را وارد کنید.');
      return;
    }

    try {
      await assignCollectionTask({
        id: task.id,
        collector: parsedCollectorId,
      }).unwrap();

      notifySuccess('جمع‌آورنده با موفقیت تخصیص داده شد.');
      await refetch();
    } catch (assignmentError) {
      notifyError(getApiError(assignmentError).message);
    }
  };

  if (!canView) {
    return (
      <Stack spacing={2} dir="rtl">
        <Typography variant="h4">
          جزئیات وظیفه جمع‌آوری
        </Typography>

        <Alert severity="error">
          شما مجوز مشاهده وظایف جمع‌آوری را ندارید.
        </Alert>

        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard/collection-tasks')}
          sx={{ alignSelf: 'flex-start' }}
        >
          بازگشت به فهرست
        </Button>
      </Stack>
    );
  }

  if (taskId === undefined) {
    return (
      <Stack spacing={2} dir="rtl">
        <Typography variant="h5">
          شناسه وظیفه نامعتبر است.
        </Typography>

        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard/collection-tasks')}
          sx={{ alignSelf: 'flex-start' }}
        >
          بازگشت به فهرست
        </Button>
      </Stack>
    );
  }

  if (isLoading || (isFetching && !task)) {
    return (
      <Stack
        alignItems="center"
        spacing={2}
        sx={{ py: 5 }}
        dir="rtl"
      >
        <CircularProgress />

        <Typography>
          در حال دریافت اطلاعات وظیفه...
        </Typography>
      </Stack>
    );
  }

  if (isError || !task) {
    return (
      <Stack spacing={2} dir="rtl">
        <Typography variant="h5">
          جزئیات وظیفه جمع‌آوری
        </Typography>

        <Alert severity="error">
          {isError
            ? getApiError(error).message
            : 'وظیفه موردنظر پیدا نشد.'}
        </Alert>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={() => void refetch()}
          >
            تلاش مجدد
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/collection-tasks')}
          >
            بازگشت به فهرست
          </Button>
        </Stack>
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
          جزئیات وظیفه جمع‌آوری #{task.id}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate('/dashboard/collection-tasks')}
        >
          بازگشت به فهرست
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            اطلاعات وظیفه
          </Typography>

          <Divider />

          <DetailItem
            label="شناسه وظیفه"
            value={task.id}
          />

          <DetailItem
            label="شناسه سفارش"
            value={task.order}
          />

          <DetailItem
            label="نوع وظیفه"
            value={taskTypeLabels[task.task_type] ?? task.task_type}
          />

          <DetailItem
            label="وضعیت"
            value={statusLabels[task.status] ?? task.status}
          />

          <DetailItem
            label="شناسه جمع‌آورنده"
            value={task.collector ?? 'تخصیص داده نشده'}
          />

          <DetailItem
            label="زمان برنامه‌ریزی‌شده"
            value={formatDate(task.scheduled_at)}
          />

          <DetailItem
            label="زمان شروع"
            value={formatDate(task.started_at)}
          />

          <DetailItem
            label="زمان تکمیل"
            value={formatDate(task.completed_at)}
          />

          <DetailItem
            label="توضیحات"
            value={task.notes || 'توضیحی ثبت نشده است.'}
          />

          <DetailItem
            label="تاریخ ایجاد"
            value={formatDate(task.created_at)}
          />

          <DetailItem
            label="آخرین به‌روزرسانی"
            value={formatDate(task.updated_at)}
          />
        </Stack>
      </Paper>

      {canAssign && (
        <Paper sx={{ p: 3 }}>
          <Stack
            component="form"
            spacing={2}
            onSubmit={handleAssign}
          >
            <Typography variant="h6">
              تخصیص جمع‌آورنده
            </Typography>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              شناسه کاربری جمع‌آورنده را وارد کنید. معتبر بودن
              کاربر و مجاز بودن او برای این وظیفه در سمت سرور
              بررسی می‌شود.
            </Typography>

            <TextField
              label="شناسه کاربری جمع‌آورنده"
              type="number"
              value={collectorId}
              onChange={(event) => setCollectorId(event.target.value)}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
              required
              disabled={isAssigning}
            />

            <Stack direction="row" justifyContent="flex-start">
              <Button
                type="submit"
                variant="contained"
                startIcon={<AssignmentIndOutlinedIcon />}
                disabled={
                  isAssigning ||
                  !collectorId.trim() ||
                  task.status === 'completed' ||
                  task.status === 'cancelled' ||
                  task.status === 'failed'
                }
              >
                {isAssigning
                  ? 'در حال تخصیص...'
                  : task.collector != null
                    ? 'تغییر جمع‌آورنده'
                    : 'تخصیص جمع‌آورنده'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default CollectionTaskDetailPage;  