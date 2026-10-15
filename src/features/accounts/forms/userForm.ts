
import { FormConfig } from 'shared/forms/types/form';
import { userValidationSchema } from 'features/accounts/forms/userValidation';

export type UserFormMode = 'create' | 'edit';

export const getUserFormConfig = (
  mode: UserFormMode
): FormConfig => {
  const isCreate = mode === 'create';

  const fields: FormConfig['fields'] = {
    mobile: {
      type: 'text',
      label: 'شماره موبایل',
      inputType: 'tel',
      required: true,
      readOnly: !isCreate,
      grid: { xs: 12, md: 6 },
    },

    email: {
      type: 'text',
      label: 'ایمیل',
      inputType: 'email',
      grid: { xs: 12, md: 6 },
    },

    branch: {
      type: 'select',
      label: 'شعبه',
      grid: { xs: 12, md: 6 },
    },

    is_active: {
      type: 'switch',
      label: 'فعال',
      defaultValue: true,
      grid: { xs: 12, md: 6 },
    },
  };

  if (isCreate) {
    fields.password = {
      type: 'text',
      label: 'رمز عبور',
      inputType: 'password',
      required: true,
      grid: { xs: 12, md: 6 },
    };
  } else {
    fields.id = {
      type: 'number',
      label: 'شناسه',
      readOnly: true,
      grid: { xs: 12, md: 6 },
    };

    fields.is_mobile_verified = {
      type: 'switch',
      label: 'تأیید شماره موبایل',
      readOnly: true,
      grid: { xs: 12, md: 6 },
    };

    fields.created_at = {
      type: 'text',
      label: 'تاریخ ایجاد',
      readOnly: true,
      grid: { xs: 12, md: 6 },
    };

    fields.updated_at = {
      type: 'text',
      label: 'آخرین بروزرسانی',
      readOnly: true,
      grid: { xs: 12, md: 6 },
    };
  }

  return {
    fields,
    validationSchema: isCreate
      ? userValidationSchema
      : userValidationSchema.omit(['password']),
  };
};