
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';
import { useGetBranchesQuery } from 'features/freight/api/branchApi';
import {
  useCreateDispatchBatchMutation,
  useGetDispatchBatchesQuery,
} from 'features/freight/api/dispatchApi';
import { DispatchBatch } from 'features/freight/types/dispatch';
import { convertToPersianDigits } from 'shared/utils/number';

const statusLabels: Record<DispatchBatch['status'], string> = {
  draft: 'پیش‌نویس',
  ready: 'آماده ارسال',
  assigned: 'مسئول ارسال تعیین‌شده',
  in_progress: 'در حال ارسال',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

const formatDate = (value: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('fa-IR');
};

const DispatchBatchesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetDispatchBatchesQuery({
    page: page + 1,
    page_size: pageSize,
  });

  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery({ page_size: 100 });

  const [
    createDispatchBatch,
    { isLoading: isCreating },
  ] = useCreateDispatchBatchMutation();

  useEffect(() => {
    if (!isError || !error) return;

    const apiError = getApiError(error);

    if (apiError.code === 'INVALID_PAGE' && page > 0) {
      setPage((currentPage) => Math.max(0, currentPage - 1));
      return;
    }

    notifyError(apiError.message);
  }, [isError, error, page]);

  const resetForm = () => {
    setBranchId('');
    setScheduledAt('');
    setNotes('');
  };

  const handleClose = () => {
    if (isCreating) return;

    setDialogOpen(false);
    resetForm();
  };

  const handleCreate = async () => {
    if (!branchId) {
      notifyError('لطفاً شعبه را انتخاب کنید.');
      return;
    }

    try {
      await createDispatchBatch({
        branch: Number(branchId),
        scheduled_at: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null,
        notes: notes.trim(),
      }).unwrap();

      notifySuccess('دسته ارسال با موفقیت ایجاد شد.');
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      notifyError(getApiError(error).message);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'شناسه دسته',
      render: (batch: DispatchBatch) =>
        convertToPersianDigits(batch.id),
    },
    {
      key: 'branch',
      header: 'شناسه شعبه',
      render: (batch: DispatchBatch) =>
        convertToPersianDigits(batch.branch),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (batch: DispatchBatch) =>
        statusLabels[batch.status] ?? batch.status,
    },
    {
      key: 'orders',
      header: 'تعداد سفارش',
      render: (batch: DispatchBatch) =>
        convertToPersianDigits(batch.orders?.length ?? 0),
    },
    {
      key: 'scheduled_at',
      header: 'زمان برنامه‌ریزی‌شده',
      render: (batch: DispatchBatch) =>
        batch.scheduled_at
          ? new Date(batch.scheduled_at).toLocaleString('fa-IR')
          : '—',
    },
    {
      key: 'created_at',
      header: 'تاریخ ایجاد',
      render: (batch: DispatchBatch) => formatDate(batch.created_at),
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
        <Typography variant="h4">دسته‌های ارسال</Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          ایجاد دسته ارسال
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            تعداد دسته‌ها: {data?.count ?? 0}
          </Typography>

          <DataTable<DispatchBatch>
            rows={data?.results ?? []}
            columns={columns}
            getRowId={(batch) => batch.id}
            loading={isLoading || isFetching}
            emptyMessage="دسته ارسالی ثبت نشده است."
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
                onClick: (batch) =>
                  navigate(`/dashboard/dispatch-batches/${batch.id}`),
              },
            ]}
          />
        </Stack>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
      >
        <DialogTitle>ایجاد دسته ارسال جدید</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              required
              fullWidth
              label="شعبه"
              value={branchId}
              disabled={branchesLoading || isCreating}
              onChange={(event) => setBranchId(event.target.value)}
            >
              {(branchesData?.results ?? []).map((branch) => (
                <MenuItem key={branch.id} value={String(branch.id)}>
                  {branch.name} — {branch.city}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="datetime-local"
              label="زمان برنامه‌ریزی‌شده"
              value={scheduledAt}
              disabled={isCreating}
              onChange={(event) => setScheduledAt(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="توضیحات"
              value={notes}
              disabled={isCreating}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isCreating}>
            انصراف
          </Button>

          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isCreating || branchesLoading}
          >
            {isCreating ? 'در حال ثبت...' : 'ایجاد دسته'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DispatchBatchesPage;
