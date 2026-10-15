import * as yup from 'yup';
import { FormValidationSchema } from 'shared/forms/validation';

export const shipmentOrderValidationSchema: FormValidationSchema =
  yup.object({
    branch: yup
      .number()
      .typeError('انتخاب شعبه الزامی است')
      .required('انتخاب شعبه الزامی است'),

    customer: yup
      .number()
      .typeError('انتخاب مشتری الزامی است')
      .required('انتخاب مشتری الزامی است'),

    preferred_freight_company: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value
      ),

    sender_name: yup.string().trim().required('نام فرستنده الزامی است'),
    sender_mobile: yup.string().trim().required('موبایل فرستنده الزامی است'),
    sender_address: yup.string().trim().required('آدرس فرستنده الزامی است'),

    receiver_name: yup.string().trim().required('نام گیرنده الزامی است'),
    receiver_mobile: yup.string().trim().required('موبایل گیرنده الزامی است'),
    receiver_address: yup.string().trim().required('آدرس گیرنده الزامی است'),

    shipment_description: yup.string().nullable(),
  });