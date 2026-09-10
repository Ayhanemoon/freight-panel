import React from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLoginMutation } from 'features/api/authApi';
import { setCredentials } from 'features/auth/authSlice';
import { useForm, SubmitHandler } from 'react-hook-form';
import { loginValidationSchema } from 'validations/authValidation';
import { TextField, Button, CircularProgress } from '@mui/material';
import './LoginForm.scss';

interface LoginFormInputs {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await login(data).unwrap(); 
      dispatch(setCredentials({ token: response.token, user: response.user })); // Update the Redux store
    } catch (err) {
      toast.error('ورود ناموفق. لطفاً دوباره تلاش کنید.');
      console.error('Login failed:', err);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="login-form__title">ورود</h2>
      <div className="login-form__field">
        <TextField
          label="نام کاربری"
          variant="outlined"
          fullWidth
          {...register('username')}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
      </div>
      <div className="login-form__field">
        <TextField
          label="رمز عبور"
          type="password"
          variant="outlined"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </div>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isLoading}
        className="login-form__button"
      >
        {isLoading ? <CircularProgress size={24} /> : 'ورود'}
      </Button>
      {error && <p className="login-form__error">ورود ناموفق. لطفاً دوباره تلاش کنید.</p>}
      <p className="login-form__register">
        اکانت ندارید ؟ <a href="/register">اینجا ثبت نام کنید</a>
      </p>
    </form>
  );
};

export default LoginForm;