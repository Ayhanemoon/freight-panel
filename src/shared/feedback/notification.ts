import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
position: 'top-right',
autoClose: 3000,
rtl: true,
};

export const notifySuccess = (message: string): void => {
toast.success(message, defaultOptions);
};

export const notifyError = (message: string): void => {
toast.error(message, {
...defaultOptions,
autoClose: 5000,
});
};

export const notifyInfo = (message: string): void => {
toast.info(message, defaultOptions);
};

export const notifyWarning = (message: string): void => {
toast.warning(message, defaultOptions);
};
