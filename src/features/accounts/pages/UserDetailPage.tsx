import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { getApiError } from 'shared/api/apiError';
import { useGetUserByIdQuery } from 'features/accounts/api/userApi';

const UserDetailPage: React.FC = () => {
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

  if (isLoading) {
    return (
      <div dir="rtl">
        <Typography variant="h5">
          اطلاعات کاربر
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
          اطلاعات کاربر
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
            اطلاعات کاربر
          </Typography>

          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/users')}
          >
            بازگشت
          </Button>
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography>
              شناسه: {user.id}
            </Typography>

            <Typography>
              شماره موبایل: {user.mobile}
            </Typography>

            <Typography>
              ایمیل: {user.email || '—'}
            </Typography>

            <Typography>
              شعبه: {user.branch?.name || '—'}
            </Typography>

            <Typography>
              وضعیت: {user.is_active ? 'فعال' : 'غیرفعال'}
            </Typography>

            <Typography>
              تأیید موبایل:{' '}
              {user.is_mobile_verified ? 'بله' : 'خیر'}
            </Typography>

            <Typography>
              روش احراز هویت: {user.auth_provider}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default UserDetailPage;