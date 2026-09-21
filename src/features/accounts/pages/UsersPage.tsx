import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Paper, Stack, Typography } from '@mui/material';

import { getApiError } from 'shared/api/apiError';
import FormRenderer from 'shared/forms/FormRenderer';
import { FormValues } from 'shared/forms/types/form';
import { userFormConfig } from 'features/accounts/forms/userForm';
import { useGetBranchesQuery } from 'features/freight/api/branchApi';
import { userFormToCreateRequest } from 'features/accounts/forms/userMapping';
import { useGetUsersQuery, useCreateUserMutation } from 'features/accounts/api/userApi';


const UsersPage: React.FC = () => {
  const { data, isLoading, isError, error } = useGetUsersQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

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

  if (isLoading) {
    return (
      <div dir="rtl">
        <Typography variant="h5">کاربران</Typography>
        <Typography>در حال دریافت کاربران...</Typography>
      </div>
    );
  }

  if (isError) {
    const apiError = getApiError(error);

    console.error('Users API error:', apiError);

    return (
      <div dir="rtl">
        <Typography variant="h5">کاربران</Typography>
        <Typography>{apiError.message}</Typography>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Stack spacing={3}>
        <Typography variant="h4">کاربران</Typography>

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

            <Stack direction="row" justifyContent="flex-start">
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? 'در حال ذخیره...' : 'ذخیره'}
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

            {data?.results.length ? (
              <table>
                <thead>
                  <tr>
                    <th>شناسه</th>
                    <th>شماره موبایل</th>
                    <th>ایمیل</th>
                    <th>شعبه</th>
                    <th>فعال</th>
                    <th>تأیید موبایل</th>
                  </tr>
                </thead>

                <tbody>
                  {data.results.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.mobile}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.branch?.name || '-'}</td>
                      <td>{user.is_active ? 'بله' : 'خیر'}</td>
                      <td>
                        {user.is_mobile_verified ? 'بله' : 'خیر'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Typography>
                کاربری وجود ندارد.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default UsersPage;