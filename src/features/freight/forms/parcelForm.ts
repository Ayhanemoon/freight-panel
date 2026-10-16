import * as yup from 'yup';

import { FormConfig } from 'shared/forms/types/form';
import { FormValidationSchema } from 'shared/forms/validation';

const optionalNonNegativeNumber = (label: string) =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null
        ? null
        : value
    )
    .nullable()
    .min(0, `${label} نمی‌تواند منفی باشد.`);

export const parcelValidationSchema: FormValidationSchema = yup.object({
  parcel_number: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null
        ? undefined
        : value
    )
    .typeError('شماره بسته باید عدد باشد.')
    .required('شماره بسته الزامی است.')
    .integer('شماره بسته باید عدد صحیح باشد.')
    .min(1, 'شماره بسته باید بزرگ‌تر از صفر باشد.'),

  contents_description: yup.string().default(''),

  declared_weight_kg: optionalNonNegativeNumber('وزن'),

  declared_length_cm: optionalNonNegativeNumber('طول'),

  declared_width_cm: optionalNonNegativeNumber('عرض'),

  declared_height_cm: optionalNonNegativeNumber('ارتفاع'),
});

export const parcelFormConfig: FormConfig = {
  validationSchema: parcelValidationSchema,
  defaultValues: {
    parcel_number: '',
    contents_description: '',
    declared_weight_kg: '',
    declared_length_cm: '',
    declared_width_cm: '',
    declared_height_cm: '',
  },
  fields: {
    parcel_number: {
      type: 'number',
      label: 'شماره بسته',
      required: true,
      grid: { xs: 12, sm: 6 },
    },
    contents_description: {
      type: 'textarea',
      label: 'شرح محتویات',
      grid: { xs: 12 },
    },
    declared_weight_kg: {
      type: 'number',
      label: 'وزن (کیلوگرم)',
      grid: { xs: 12, sm: 6 },
    },
    declared_length_cm: {
      type: 'number',
      label: 'طول (سانتی‌متر)',
      grid: { xs: 12, sm: 4 },
    },
    declared_width_cm: {
      type: 'number',
      label: 'عرض (سانتی‌متر)',
      grid: { xs: 12, sm: 4 },
    },
    declared_height_cm: {
      type: 'number',
      label: 'ارتفاع (سانتی‌متر)',
      grid: { xs: 12, sm: 4 },
    },
  },
};