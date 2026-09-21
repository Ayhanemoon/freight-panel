import { FormConfig } from 'shared/forms/types/form';

export const userFormConfig: FormConfig = {
  fields: {
    id: {
      type: 'number',
      label: 'شناسه',
      readOnly: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    mobile: {
      type: 'text',
      label: 'شماره موبایل',
      required: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    email: {
      type: 'text',
      label: 'ایمیل',
      grid: {
        xs: 12,
        md: 6,
      },
    },

    branch: {
      type: 'select',
      label: 'شعبه',
      required: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    password: {
      type: 'text',
      label: 'رمز عبور',
      required: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    is_active: {
      type: 'switch',
      label: 'فعال',
      defaultValue: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    is_mobile_verified: {
      type: 'switch',
      label: 'تأیید شماره موبایل',
      readOnly: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    created_at: {
      type: 'text',
      label: 'تاریخ ایجاد',
      readOnly: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },

    updated_at: {
      type: 'text',
      label: 'آخرین بروزرسانی',
      readOnly: true,
      grid: {
        xs: 12,
        md: 6,
      },
    },
  },
};