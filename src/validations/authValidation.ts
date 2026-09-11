import * as yup from 'yup';

export const loginValidationSchema = yup.object().shape({
  mobile: yup.string().required('Mobile is required').min(10, 'Mobile must be at least 10 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});