
import { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router-dom';

import DataTable from 'shared/components/DataTable/DataTable';
import { getApiError } from 'shared/api/apiError';
import { notifyError } from 'shared/feedback/notification';

import {
  useGetCollectionTasksQuery,
} from 'features/freight/api/collectionTaskApi';
import {
  useGetBranchesQuery,
} from 'features/freight/api/branchApi';
import {
  useCurrentUserCapabilities,
} from 'features/accounts/context/CurrentUserContext';
import {
  canViewCollectionTasks,
  canCreateCollectionTasks,
  canFilterCollectionTasksByBranch,
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

const formatDate = (value: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fa-IR');
};

const CollectionTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useCurrentUserCapabilities();

  const canViewTasks = canViewCollectionTasks(user);
  const canCreateTasks = canCreateCollectionTasks(user);
  const canFilterByBranch =
    canFilterCollectionTasksByBranch(user);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedBranch, setSelectedBranch] = useState('');

  const {
    data: branchesData,
    isError: isBranchesError,
    error: branchesError,
  } = useGetBranchesQuery(undefined, {
    skip: !canFilterByBranch,
  });

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetCollectionTasksQuery(
    {
      page: page + 1,
      page_size: pageSize,
      ...(canFilterByBranch && selectedBranch
        ? { branch: Number(selectedBranch) }
        : {}),
    },
    {
      skip: !canViewTasks,
    }
  );

  useEffect(() => {
    if (!isError || !error) return;

    const apiError = getApiError(error);

    // Recover from an invalid page without a redundant error toast.
    if (apiError.code === 'INVALID_PAGE' && page > 0) {
      setPage((currentPage) => Math.max(0, currentPage - 1));
      return;
    }

    notifyError(apiError.message);
  }, [isError, error, page]);

  useEffect(() => {
    if (!isBranchesError || !branchesError) return;

    notifyError(getApiError(branchesError).message);
  }, [isBranchesError, branchesError]);

  const columns = [
    {
      key: 'id',
      header: 'شناسه وظیفه',
      render: (task: CollectionTask) => task.id,
    },
    {
      key: 'order',
      header: 'شناسه سفارش',
      render: (task: CollectionTask) => task.order,
    },
    {
      key: 'task_type',
      header: 'نوع دریافت',
      render: (task: CollectionTask) =>
        taskTypeLabels[task.task_type] ?? task.task_type,
    },
    {
      key: 'collector',
      header: 'شناسه جمع‌آورنده',
      render: (task: CollectionTask) =>
        task.collector ?? 'تخصیص داده نشده',
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (task: CollectionTask) =>
        statusLabels[task.status] ?? task.status,
    },
    {
      key: 'scheduled_at',
      header: 'زمان برنامه‌ریزی‌شده',
      render: (task: CollectionTask) =>
        formatDate(task.scheduled_at),
    },
    {
      key: 'created_at',
      header: 'تاریخ ایجاد',
      render: (task: CollectionTask) =>
        formatDate(task.created_at),
    },
  ];

  if (!canViewTasks) {
    return (
      <Stack spacing={2} dir="rtl">
        <Typography variant="h4">
          وظایف جمع‌آوری
        </Typography>

        <Typography color="text.secondary">
          شما مجوز مشاهده وظایف جمع‌آوری را ندارید.
        </Typography>
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
          وظایف جمع‌آوری
        </Typography>

        {canCreateTasks && (
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() =>
              navigate('/dashboard/collection-tasks/new')
            }
          >
            ایجاد وظیفه
          </Button>
        )}
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {canFilterByBranch && (
            <FormControl fullWidth>
              <InputLabel id="collection-task-branch-label">
                فیلتر بر اساس شعبه
              </InputLabel>

              <Select
                labelId="collection-task-branch-label"
                value={selectedBranch}
                label="فیلتر بر اساس شعبه"
                onChange={(event) => {
                  setSelectedBranch(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">
                  همه شعب
                </MenuItem>

                {(branchesData?.results ?? []).map((branch) => (
                  <MenuItem
                    key={branch.id}
                    value={String(branch.id)}
                  >
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="body2" color="text.secondary">
            تعداد وظایف: {data?.count ?? 0}
          </Typography>

          <DataTable<CollectionTask>
            rows={data?.results ?? []}
            columns={columns}
            getRowId={(task) => task.id}
            loading={isLoading || isFetching}
            emptyMessage="وظیفه جمع‌آوری‌ای ثبت نشده است."
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
                label: 'مشاهده وظیفه',
                icon: <VisibilityOutlinedIcon />,
                onClick: (task) =>
                  navigate(
                    `/dashboard/collection-tasks/${task.id}`
                  ),
              },
            ]}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default CollectionTasksPage;
