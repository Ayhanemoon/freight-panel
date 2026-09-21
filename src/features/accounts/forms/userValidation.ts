import * as yup from 'yup';
import { FormValidationSchema } from 'shared/forms/validation';

export const userValidationSchema: FormValidationSchema = yup.object({
  mobile: yup
    .string()
    .required('شماره موبایل الزامی است')
    .min(10, 'شماره موبایل معتبر نیست')
    .max(15, 'شماره موبایل معتبر نیست'),

  email: yup
    .string()
    .email('فرمت ایمیل معتبر نیست')
    .nullable(),

  branch: yup
    .number()
    .nullable(),

  is_active: yup
    .boolean(),

  is_mobile_verified: yup
    .boolean(),
});