import React, { createContext, useContext } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import { CurrentUserCapabilities } from 'features/accounts/types/currentUser';
import {
  useGetCurrentUserCapabilitiesQuery,
} from 'features/accounts/api/currentUserApi';
import { getApiError } from 'shared/api/apiError';

const CurrentUserContext =
  createContext<CurrentUserCapabilities | null>(null);

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

export const CurrentUserProvider: React.FC<
  CurrentUserProviderProps
> = ({ children }) => {
  const {
    currentData: capabilities,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCurrentUserCapabilitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isFetching) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ p: 4, minHeight: 200 }}
        dir="rtl"
      >
        <CircularProgress />
        <Typography>
          در حال دریافت اطلاعات کاربر...
        </Typography>
      </Stack>
    );
  }

  if (isError || !capabilities) {
    return (
      <Stack spacing={2} sx={{ p: 3 }} dir="rtl">
        <Alert severity="error">
          {isError
            ? getApiError(error).message
            : 'دریافت اطلاعات کاربر ناموفق بود.'}
        </Alert>

        <Button
          variant="outlined"
          onClick={() => void refetch()}
        >
          تلاش مجدد
        </Button>
      </Stack>
    );
  }

  return (
    <CurrentUserContext.Provider value={capabilities}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserCapabilities =
  (): CurrentUserCapabilities => {
    const context = useContext(CurrentUserContext);

    if (!context) {
      throw new Error(
        'useCurrentUserCapabilities must be used within CurrentUserProvider.'
      );
    }

    return context;
  };