import * as yup from 'yup';

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/; // At least one uppercase letter, one lowercase letter, one number, and at least 8 characters

export const validationSchemas: Record<string, any> = {
  users: yup.object().shape({
    username: yup.string().required('نام کاربری الزامی است'),
    email: yup.string().email('ایمیل نامعتبر است').required('ایمیل الزامی است'),
    password: yup.string().matches(passwordRegex, 'رمز عبور باید حداقل 8 کاراکتر، شامل یک حرف بزرگ، یک حرف کوچک و یک عدد باشد').required('رمز عبور الزامی است'),
    birthDate: yup.string().typeError('فرمت تاریخ نا معتبر است').required('تاریخ تولد الزامی است').nullable(),
    role: yup.string().required('نقش الزامی است'),
    firstName: yup.string().required('نام الزامی است'),
    lastName: yup.string().required('نام خانوادگی الزامی است'),
    phone: yup.string().required('شماره تلفن الزامی است'),
    address: yup.string().optional(),
  }),
};