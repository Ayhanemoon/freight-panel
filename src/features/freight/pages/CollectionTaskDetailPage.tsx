import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';
import DataTable from 'shared/components/DataTable/DataTable';

import {
  useAssignCollectionTaskMutation,
  useCancelCollectionTaskMutation,
  useCompleteCollectionTaskMutation,
  useFailCollectionTaskMutation,
  useGetCollectionTaskByIdQuery,
  useVerifyCollectionTaskParcelMutation,
} from 'features/freight/api/collectionTaskApi';

import { useGetParcelsQuery } from 'features/freight/api/parcelApi';

import {
  canAssignCollectionTasks,
  canCancelCollectionTasks,
  canCompleteCollectionTasks,
  canFailCollectionTasks,
  canVerifyCollectionTaskParcels,
  canViewCollectionTasks,
} from 'features/freight/permissions/collectionTaskAccess';

import { useCurrentUserCapabilities } from
  'features/accounts/context/CurrentUserContext';

import {
  CollectionTaskStatus,
  CollectionTaskType,
  VerifyCollectionTaskParcelRequest,
} from 'features/freight/types/collectionTask';

import { Parcel } from 'features/freight/types/parcel';

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

const verificationStatusLabels: Record<string, string> = {
  pending: 'در انتظار بررسی',
  verified: 'تأییدشده',
  difference_found: 'دارای مغایرت',
  rejected: 'ردشده',
};

const formatDate = (
  value: string | null | undefined
): string => {
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

type TaskStatusAction = 'cancel' | 'fail' | null;

interface VerificationFormValues {
  verified_weight_kg: string;
  verified_length_cm: string;
  verified_width_cm: string;
  verified_height_cm: string;
}

const emptyVerificationForm: VerificationFormValues = {
  verified_weight_kg: '',
  verified_length_cm: '',
  verified_width_cm: '',
  verified_height_cm: '',
};

const CollectionTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useCurrentUserCapabilities();

  const canView = canViewCollectionTasks(user);
  const canAssign = canAssignCollectionTasks(user);
  const canVerify = canVerifyCollectionTaskParcels(user);
  const canComplete = canCompleteCollectionTasks(user);
  const canCancel = canCancelCollectionTasks(user);
  const canFail = canFailCollectionTasks(user);

  const taskId =
    id && /^\d+$/.test(id) ? Number(id) : undefined;

  const {
    data: task,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchTask,
  } = useGetCollectionTaskByIdQuery(taskId ?? '', {
    skip: !canView || taskId === undefined,
  });

  const {
    data: parcelsData,
    isLoading: isParcelsLoading,
    isFetching: isParcelsFetching,
    isError: isParcelsError,
    error: parcelsError,
    refetch: refetchParcels,
  } = useGetParcelsQuery(
    {
      order: task?.order ?? '',
      page: 1,
      page_size: 100,
    },
    {
      skip: !task,
    }
  );

  const [
    assignCollectionTask,
    { isLoading: isAssigning },
  ] = useAssignCollectionTaskMutation();

  const [
    verifyCollectionTaskParcel,
    { isLoading: isVerifying },
  ] = useVerifyCollectionTaskParcelMutation();

  const [
    completeCollectionTask,
    { isLoading: isCompleting },
  ] = useCompleteCollectionTaskMutation();

  const [
    cancelCollectionTask,
    { isLoading: isCancelling },
  ] = useCancelCollectionTaskMutation();

  const [
    failCollectionTask,
    { isLoading: isFailing },
  ] = useFailCollectionTaskMutation();

  const [collectorId, setCollectorId] = useState('');
  useEffect(() => {
    setCollectorId(
      task?.collector != null ? String(task.collector) : ''
    );
  }, [task?.id, task?.collector]);
  const [selectedParcel, setSelectedParcel] =
    useState<Parcel | null>(null);

  const [verificationForm, setVerificationForm] =
    useState<VerificationFormValues>(emptyVerificationForm);

  const [statusAction, setStatusAction] =
    useState<TaskStatusAction>(null);

  const [statusNote, setStatusNote] = useState('');

  const isStatusActionLoading = isCancelling || isFailing;

  const isTaskTerminal =
    task?.status === 'completed' ||
    task?.status === 'cancelled' ||
    task?.status === 'failed';

  const isTaskActive =
    task?.status === 'assigned' ||
    task?.status === 'in_progress';

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
      await refetchTask();
    } catch (assignmentError) {
      notifyError(getApiError(assignmentError).message);
    }
  };

  const handleOpenVerification = (parcel: Parcel) => {
    setSelectedParcel(parcel);

    setVerificationForm({
      verified_weight_kg:
        parcel.declared_weight_kg ?? parcel.verified_weight_kg ?? '',
      verified_length_cm:
        parcel.declared_length_cm ?? parcel.verified_length_cm ?? '',
      verified_width_cm:
        parcel.declared_width_cm ?? parcel.verified_width_cm ?? '',
      verified_height_cm:
        parcel.declared_height_cm ?? parcel.verified_height_cm ?? '',
    });
  };

  const handleCloseVerification = () => {
    if (isVerifying) return;

    setSelectedParcel(null);
    setVerificationForm(emptyVerificationForm);
  };

  const handleVerifyParcel = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!task || !selectedParcel || !canVerify) {
      notifyError('شما مجوز بررسی بسته را ندارید.');
      return;
    }

    const values = Object.values(verificationForm);

    if (
      values.some(
        (value) =>
          !value.trim() ||
          !Number.isFinite(Number(value)) ||
          Number(value) <= 0
      )
    ) {
      notifyError('تمام اندازه‌ها باید عددی بزرگ‌تر از صفر باشند.');
      return;
    }

    const request: VerifyCollectionTaskParcelRequest = {
      parcel: selectedParcel.id,
      ...verificationForm,
    };

    try {
      const result = await verifyCollectionTaskParcel({
        taskId: task.id,
        data: request,
      }).unwrap();

      if (result.verification_status === 'difference_found') {
        notifySuccess(
          'اندازه‌های بسته ثبت شد؛ مغایرت با اطلاعات اعلام‌شده وجود دارد.'
        );
      } else {
        notifySuccess('اندازه‌های بسته با موفقیت بررسی و ثبت شد.');
      }

      setSelectedParcel(null);
      setVerificationForm(emptyVerificationForm);

      await Promise.all([
        refetchTask(),
        refetchParcels(),
      ]);
    } catch (verificationError) {
      notifyError(getApiError(verificationError).message);
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !canComplete) {
      notifyError('شما مجوز تکمیل وظیفه را ندارید.');
      return;
    }

    try {
      await completeCollectionTask(task.id).unwrap();

      notifySuccess('وظیفه جمع‌آوری با موفقیت تکمیل شد.');
      await refetchTask();
    } catch (completionError) {
      notifyError(getApiError(completionError).message);
    }
  };

  const handleOpenStatusAction = (
    action: Exclude<TaskStatusAction, null>
  ) => {
    setStatusAction(action);
    setStatusNote('');
  };

  const handleCloseStatusAction = () => {
    if (isStatusActionLoading) return;

    setStatusAction(null);
    setStatusNote('');
  };

  const handleSubmitStatusAction = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!task || !statusAction) return;

    try {
      if (statusAction === 'cancel') {
        if (!canCancel) {
          notifyError('شما مجوز لغو وظیفه را ندارید.');
          return;
        }

        await cancelCollectionTask({
          id: task.id,
          note: statusNote,
        }).unwrap();

        notifySuccess('وظیفه جمع‌آوری لغو شد.');
      } else {
        if (!canFail) {
          notifyError('شما مجوز ثبت وظیفه ناموفق را ندارید.');
          return;
        }

        if (!statusNote.trim()) {
          notifyError('برای ثبت وظیفه ناموفق، دلیل را وارد کنید.');
          return;
        }

        await failCollectionTask({
          id: task.id,
          note: statusNote,
        }).unwrap();

        notifySuccess('وضعیت وظیفه به ناموفق تغییر کرد.');
      }

      setStatusAction(null);
      setStatusNote('');

      await refetchTask();
    } catch (statusError) {
      notifyError(getApiError(statusError).message);
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
        <Alert severity="error">
          شناسه وظیفه نامعتبر است.
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
            onClick={() => void refetchTask()}
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

  const parcels = parcelsData?.results ?? [];

  const parcelColumns = [
    {
      key: 'parcel_number',
      header: 'شماره بسته',
      render: (parcel: Parcel) => parcel.parcel_number,
    },
    {
      key: 'declared_weight_kg',
      header: 'وزن اعلام‌شده',
      render: (parcel: Parcel) =>
        parcel.declared_weight_kg ?? '—',
    },
    {
      key: 'verified_weight_kg',
      header: 'وزن بررسی‌شده',
      render: (parcel: Parcel) =>
        parcel.verified_weight_kg ?? '—',
    },
    {
      key: 'declared_dimensions',
      header: 'ابعاد اعلام‌شده',
      render: (parcel: Parcel) =>
        [
          parcel.declared_length_cm,
          parcel.declared_width_cm,
          parcel.declared_height_cm,
        ].every((value) => value == null)
          ? '—'
          : `${parcel.declared_length_cm ?? '—'} × ${
              parcel.declared_width_cm ?? '—'
            } × ${parcel.declared_height_cm ?? '—'}`,
    },
    {
      key: 'verified_dimensions',
      header: 'ابعاد بررسی‌شده',
      render: (parcel: Parcel) =>
        [
          parcel.verified_length_cm,
          parcel.verified_width_cm,
          parcel.verified_height_cm,
        ].every((value) => value == null)
          ? '—'
          : `${parcel.verified_length_cm ?? '—'} × ${
              parcel.verified_width_cm ?? '—'
            } × ${parcel.verified_height_cm ?? '—'}`,
    },
    {
      key: 'verification_status',
      header: 'وضعیت بررسی',
      render: (parcel: Parcel) =>
        verificationStatusLabels[parcel.verification_status] ??
        parcel.verification_status,
    },
  ];

  const parcelActions = [
    {
      key: 'verify',
      label: 'بررسی اندازه‌ها',
      icon: <FactCheckOutlinedIcon fontSize="small" />,
      hidden: (parcel: Parcel) =>
        !canVerify ||
        !isTaskActive ||
        parcel.verification_status === 'verified' ||
        parcel.verification_status === 'difference_found',
      disabled: () => isVerifying,
      onClick: (parcel: Parcel) => handleOpenVerification(parcel),
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

          <DetailItem label="شناسه وظیفه" value={task.id} />
          <DetailItem label="شناسه سفارش" value={task.order} />

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

      {canAssign && !isTaskTerminal && (
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
              کاربر، نقش او و تعلق او به شعبه سفارش در سمت سرور
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

            <Stack direction="row">
              <Button
                type="submit"
                variant="contained"
                startIcon={<AssignmentIndOutlinedIcon />}
                disabled={isAssigning || !collectorId.trim()}
              >
                {isAssigning
                  ? 'در حال تخصیص...'
                  : task.collector != null
                    ? 'تغییر جمع‌آورنده'
                    : 'تخصیص جمع‌آورنده'
                }
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            بسته‌های سفارش
          </Typography>

          <Divider />

          {isParcelsError ? (
            <Alert severity="error">
              {getApiError(parcelsError).message}
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                تعداد بسته‌ها: {parcelsData?.count ?? 0}
              </Typography>

              <DataTable<Parcel>
                rows={parcels}
                columns={parcelColumns}
                getRowId={(parcel) => parcel.id}
                loading={isParcelsLoading || isParcelsFetching}
                emptyMessage="بسته‌ای برای این سفارش ثبت نشده است."
                actions={isTaskActive ? parcelActions : []}
              />
            </>
          )}
        </Stack>
      </Paper>

      {!isTaskTerminal && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              عملیات وظیفه
            </Typography>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              تکمیل وظیفه فقط پس از بررسی همه بسته‌ها امکان‌پذیر
              است. قوانین نهایی در سمت سرور بررسی می‌شوند.
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
            >
              {canComplete && task.status === 'in_progress' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleCompleteTask}
                  disabled={isCompleting}
                >
                  {isCompleting
                    ? 'در حال تکمیل...'
                    : 'تکمیل وظیفه'}
                </Button>
              )}

              {canCancel &&
                ['pending', 'assigned', 'in_progress'].includes(
                  task.status
                ) && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => handleOpenStatusAction('cancel')}
                    disabled={isStatusActionLoading}
                  >
                    لغو وظیفه
                  </Button>
                )}

              {canFail && task.status === 'in_progress' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ReportProblemOutlinedIcon />}
                  onClick={() => handleOpenStatusAction('fail')}
                  disabled={isStatusActionLoading}
                >
                  ثبت وظیفه ناموفق
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      <Dialog
        open={Boolean(selectedParcel)}
        onClose={handleCloseVerification}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <Stack
          component="form"
          onSubmit={handleVerifyParcel}
        >
          <DialogTitle>
            بررسی اندازه‌های بسته
            {selectedParcel
              ? ` شماره ${selectedParcel.parcel_number}`
              : ''}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                اندازه‌های واقعی بسته را وارد کنید. اگر این
                مقادیر با اطلاعات اعلام‌شده تفاوت داشته باشند،
                وضعیت بسته به «دارای مغایرت» تغییر خواهد کرد.
              </Typography>

              <TextField
                label="وزن واقعی (کیلوگرم)"
                type="number"
                value={verificationForm.verified_weight_kg}
                onChange={(event) =>
                  setVerificationForm((current) => ({
                    ...current,
                    verified_weight_kg: event.target.value,
                  }))
                }
                inputProps={{ min: 0.01, step: '0.01' }}
                required
                fullWidth
                disabled={isVerifying}
              />

              <TextField
                label="طول واقعی (سانتی‌متر)"
                type="number"
                value={verificationForm.verified_length_cm}
                onChange={(event) =>
                  setVerificationForm((current) => ({
                    ...current,
                    verified_length_cm: event.target.value,
                  }))
                }
                inputProps={{ min: 0.01, step: '0.01' }}
                required
                fullWidth
                disabled={isVerifying}
              />

              <TextField
                label="عرض واقعی (سانتی‌متر)"
                type="number"
                value={verificationForm.verified_width_cm}
                onChange={(event) =>
                  setVerificationForm((current) => ({
                    ...current,
                    verified_width_cm: event.target.value,
                  }))
                }
                inputProps={{ min: 0.01, step: '0.01' }}
                required
                fullWidth
                disabled={isVerifying}
              />

              <TextField
                label="ارتفاع واقعی (سانتی‌متر)"
                type="number"
                value={verificationForm.verified_height_cm}
                onChange={(event) =>
                  setVerificationForm((current) => ({
                    ...current,
                    verified_height_cm: event.target.value,
                  }))
                }
                inputProps={{ min: 0.01, step: '0.01' }}
                required
                fullWidth
                disabled={isVerifying}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCloseVerification}
              disabled={isVerifying}
            >
              انصراف
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isVerifying}
            >
              {isVerifying
                ? 'در حال ثبت...'
                : 'ثبت اندازه‌ها'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>

      <Dialog
        open={statusAction !== null}
        onClose={handleCloseStatusAction}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <Stack
          component="form"
          onSubmit={handleSubmitStatusAction}
        >
          <DialogTitle>
            {statusAction === 'cancel'
              ? 'لغو وظیفه جمع‌آوری'
              : 'ثبت وظیفه ناموفق'}
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {statusAction === 'cancel'
                ? 'در صورت نیاز، دلیل لغو را وارد کنید.'
                : 'دلیل ناموفق بودن وظیفه را وارد کنید.'}
            </DialogContentText>

            <TextField
              label="توضیحات"
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              required={statusAction === 'fail'}
              disabled={isStatusActionLoading}
            />
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCloseStatusAction}
              disabled={isStatusActionLoading}
            >
              انصراف
            </Button>

            <Button
              type="submit"
              variant="contained"
              color={statusAction === 'fail' ? 'error' : 'warning'}
              disabled={isStatusActionLoading}
            >
              {isStatusActionLoading
                ? 'در حال ثبت...'
                : statusAction === 'cancel'
                  ? 'تأیید لغو'
                  : 'ثبت ناموفق بودن'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </Stack>
  );
};

export default CollectionTaskDetailPage;