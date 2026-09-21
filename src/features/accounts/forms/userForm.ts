import { FormConfig } from 'shared/forms/types/form';

export const userFormConfig: FormConfig = {
  fields: {
    mobile: {
      type: 'text',
      label: 'شماره موبایل',
      required: true,
      defaultValue: '',
      grid: {
        xs: 12,
        md: 6,
      },
    },

    email: {
      type: 'text',
      label: 'ایمیل',
      required: true,
      defaultValue: '',
      grid: {
        xs: 12,
        md: 6,
      },
    },

    branch: {
      type: 'number',
      label: 'شناسه شعبه',
      defaultValue: null,
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
      defaultValue: false,
      grid: {
        xs: 12,
        md: 6,
      },
    },
  },

  defaultValues: {
    mobile: '',
    email: '',
    branch: null,
    is_active: true,
    is_mobile_verified: false,
  },
};