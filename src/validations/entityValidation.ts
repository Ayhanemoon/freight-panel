import * as yup from 'yup';

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/; // At least one uppercase letter, one lowercase letter, one number, and at least 8 characters

export const validationSchemas: Record<string, any> = {
  users: yup.object().shape({
    mobile: yup.string().required('شماره موبایل الزامی است'),
    email: yup.string().email('ایمیل نامعتبر است').required('ایمیل الزامی است'),
    branch: yup.string().matches(passwordRegex, 'رمز عبور باید حداقل 8 کاراکتر، شامل یک حرف بزرگ، یک حرف کوچک و یک عدد باشد').required('رمز عبور الزامی است'),
    branch_name: yup.string().required('نام الزامی است'),
  }),
};