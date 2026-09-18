import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ApiError {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'CUSTOM_ERROR';
  message: string;
  fieldErrors: Record<string, string[]>;
}

interface ErrorData {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export const getApiError = (error: unknown): ApiError => {
  if (!error || typeof error !== 'object') {
    return {
      status: 'CUSTOM_ERROR',
      message: 'خطای نامشخصی رخ داده است.',
      fieldErrors: {},
    };
  }

  const apiError = error as FetchBaseQueryError;

  if (apiError.status === 'FETCH_ERROR') {
    return {
      status: 'FETCH_ERROR',
      message: 'ارتباط با سرور برقرار نشد.',
      fieldErrors: {},
    };
  }

  if (apiError.status === 'PARSING_ERROR') {
    return {
      status: 'PARSING_ERROR',
      message: 'پاسخ نامعتبر از سرور دریافت شد.',
      fieldErrors: {},
    };
  }

  if (apiError.status === 'CUSTOM_ERROR') {
    return {
      status: 'CUSTOM_ERROR',
      message: 'خطایی در درخواست رخ داد.',
      fieldErrors: {},
    };
  }

  if (typeof apiError.status === 'number') {
    const data = apiError.data as ErrorData | undefined;

    const fieldErrors: Record<string, string[]> = {};

    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([field, value]) => {
        if (field === 'detail' || field === 'message') {
          return;
        }

        if (Array.isArray(value)) {
          fieldErrors[field] = value.map(String);
        } else if (typeof value === 'string') {
          fieldErrors[field] = [value];
        }
      });
    }

    let message = 'خطایی در درخواست رخ داد.';

    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (typeof data?.message === 'string') {
      message = data.message;
    } else if (apiError.status === 400) {
      message = 'اطلاعات ارسال‌شده معتبر نیست.';
    } else if (apiError.status === 401) {
      message = 'احراز هویت انجام نشد.';
    } else if (apiError.status === 403) {
      message = 'شما اجازه انجام این عملیات را ندارید.';
    } else if (apiError.status === 404) {
      message = 'مورد درخواست پیدا نشد.';
    } else if (apiError.status === 409) {
      message = 'این عملیات با وضعیت فعلی اطلاعات سازگار نیست.';
    } else if (apiError.status >= 500) {
      message = 'خطایی در سرور رخ داده است.';
    }

    return {
      status: apiError.status,
      message,
      fieldErrors,
    };
  }

  return {
    status: 'CUSTOM_ERROR',
    message: 'خطای نامشخصی رخ داده است.',
    fieldErrors: {},
  };
};