import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { getApiError } from 'shared/api/apiError';
import FormRenderer from 'shared/forms/FormRenderer';
import { FormValues } from 'shared/forms/types/form';

import { userFormConfig } from 'features/accounts/forms/userForm';
import {
  userToFormValues,
  userFormToUpdateRequest,
} from 'features/accounts/forms/userMapping';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from 'features/accounts/api/userApi';
import { useGetBranchesQuery } from 'features/freight/api/branchApi';

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useGetUserByIdQuery(id ?? '', {
    skip: !id,
  });

  const { data: branchesData } = useGetBranchesQuery();

  const [updateUser, { isLoading: isUpdating }] =
    useUpdateUserMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(userFormConfig.validationSchema!),
    defaultValues: {},
  });

  useEffect(() => {
    if (user) {
      reset(userToFormValues(user));
    }
  }, [user, reset]);

  const branchOptions =
    branchesData?.results.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })) ?? [];

  const handleSubmitUser = async (values: FormValues) => {
    if (!id) {
      return;
    }

    const request = userFormToUpdateRequest(values);

    try {
      await updateUser({
        id,
        data: request,
      }).unwrap();

      navigate(`/dashboard/users/${id}`);
    } catch (error) {
      console.error(
        'Update user error:',
        getApiError(error)
      );
    }
  };

  if (isLoading) {
    return (
      <div dir="rtl">
        <Typography variant="h5">
          ویرایش کاربر
        </Typography>

        <Typography>
          در حال دریافت اطلاعات کاربر...
        </Typography>
      </div>
    );
  }

  if (isError) {
    const apiError = getApiError(error);

    return (
      <div dir="rtl">
        <Typography variant="h5">
          ویرایش کاربر
        </Typography>

        <Typography>
          {apiError.message}
        </Typography>

        <Button
          onClick={() => navigate('/dashboard/users')}
        >
          بازگشت به کاربران
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div dir="rtl">
        <Typography>
          کاربر پیدا نشد.
        </Typography>

        <Button
          onClick={() => navigate('/dashboard/users')}
        >
          بازگشت به کاربران
        </Button>
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
        >
          <Typography variant="h4">
            ویرایش کاربر
          </Typography>

          <Button
            variant="outlined"
            onClick={() =>
              navigate(`/dashboard/users/${user.id}`)
            }
          >
            بازگشت
          </Button>
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit(handleSubmitUser)}
          >
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
                disabled={isUpdating}
              >
                {isUpdating
                  ? 'در حال ذخیره...'
                  : 'ذخیره تغییرات'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default UserEditPage;