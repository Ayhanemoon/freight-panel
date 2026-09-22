import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Paper, Stack, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { getApiError } from 'shared/api/apiError';
import FormRenderer from 'shared/forms/FormRenderer';
import { FormValues } from 'shared/forms/types/form';
import DataTable from 'shared/components/DataTable/DataTable';

import { getUserFormConfig } from 'features/accounts/forms/userForm';
import { useGetBranchesQuery } from 'features/freight/api/branchApi';
import { userFormToCreateRequest } from 'features/accounts/forms/userMapping';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation
} from 'features/accounts/api/userApi';
import { User } from 'features/accounts/types/user';

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();
  const userFormConfig = getUserFormConfig('create');

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetUsersQuery({
    page: page + 1,
    page_size: pageSize,
  });

  const { data: branchesData } = useGetBranchesQuery();

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
  
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();

  const branchOptions =
    branchesData?.results.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })) ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(userFormConfig.validationSchema!),
    defaultValues: {
      mobile: '',
      email: '',
      branch: null,
      password: '',
      is_active: true,
      is_mobile_verified: false,
    },
  });

  const handleUserSubmit = async (values: FormValues) => {
    const request = userFormToCreateRequest(values);

    try {
      await createUser(request).unwrap();
      console.log('User created successfully');
    } catch (error) {
      console.error('Create user error:', error);
    }
  };

  const userColumns = [
    {
      key: 'id',
      header: 'شناسه',
      align: 'right' as const,
      width: 40,
    },
    {
      key: 'mobile',
      header: 'شماره موبایل',
      align: 'right' as const,
    },
    {
      key: 'email',
      header: 'ایمیل',
      align: 'right' as const,
      render: (user: User) => user.email || '—',
      truncate: true,
    },
    {
      key: 'branch',
      header: 'شعبه',
      align: 'right' as const,
      render: (user: User) => user.branch?.name || '—',
    },
    {
      key: 'is_active',
      header: 'فعال',
      align: 'center' as const,
      render: (user: User) =>
        user.is_active ? 'بله' : 'خیر',
    },
    {
      key: 'is_mobile_verified',
      header: 'تأیید موبایل',
      align: 'center' as const,
      render: (user: User) =>
        user.is_mobile_verified ? 'بله' : 'خیر',
    },
  ];


  const userActions = [
    {
      key: 'view',
      label: 'مشاهده',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (user: User) => {
        navigate(`/dashboard/users/${user.id}`);
      },
    },
    {
      key: 'edit',
      label: 'ویرایش',
      icon: <EditIcon fontSize="small" />,
      onClick: (user: User) => {
        navigate(`/dashboard/users/${user.id}/edit`);
      },
    },
    {
      key: 'toggle-active',
      label: (user: User) =>
        user.is_active
          ? 'غیرفعال کردن'
          : 'فعال کردن',

      icon: (user: User) =>
        user.is_active ? (
          <BlockIcon fontSize="small" />
        ) : (
          <CheckCircleIcon fontSize="small" />
        ),

      disabled: () =>
        isDeactivating || isActivating,

      onClick: async (user: User) => {
        try {
          if (user.is_active) {
            await deactivateUser(String(user.id)).unwrap();
          } else {
            await activateUser(String(user.id)).unwrap();
          }
        } catch (error) {
          console.error(
            user.is_active
              ? 'Deactivate user error:'
              : 'Activate user error:',
            getApiError(error)
          );
        }
      },
    },
  ];

  if (isLoading) {
    return (
      <div dir="rtl">
        <Typography variant="h5">کاربران</Typography>
        <Typography>
          در حال دریافت کاربران...
        </Typography>
      </div>
    );
  }

  if (isError) {
    const apiError = getApiError(error);

    console.error('Users API error:', apiError);

    return (
      <div dir="rtl">
        <Typography variant="h5">کاربران</Typography>
        <Typography>
          {apiError.message}
        </Typography>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Stack spacing={3}>
        <Typography variant="h4">
          کاربران
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit(handleUserSubmit)}
          >
            <Typography variant="h6">
              اطلاعات کاربر
            </Typography>

            <FormRenderer
              config={userFormConfig}
              control={control}
              errors={errors}
              fieldOptions={{
                branch: branchOptions,
              }}
            />

            <Stack
              direction="row"
              justifyContent="flex-start"
            >
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating}
              >
                {isCreating
                  ? 'در حال ذخیره...'
                  : 'ذخیره'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              فهرست کاربران
            </Typography>

            <Typography>
              تعداد کاربران: {data?.count ?? 0}
            </Typography>

            <DataTable<User>
              rows={data?.results ?? []}
              columns={userColumns}
              getRowId={(user) => user.id}
              loading={isFetching}
              emptyMessage="کاربری وجود ندارد."
              actions={userActions}
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
            />
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default UsersPage;