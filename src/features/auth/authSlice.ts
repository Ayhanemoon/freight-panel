import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  access: string | null;
  refresh: string | null;
  access_expires_at: string | null;
  refresh_expires_at: string | null;
  user_id: string | null;
  mobile: string | null;
}

const initialState: AuthState = {
  access: localStorage.getItem('access'),
  refresh: localStorage.getItem('refresh'),
  access_expires_at: localStorage.getItem('access_expires_at'),
  refresh_expires_at: localStorage.getItem('refresh_expires_at'),
  user_id: localStorage.getItem('user_id'),
  mobile: localStorage.getItem('mobile'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        access: string;
        refresh: string;
        access_expires_at: string;
        refresh_expires_at: string;
        user_id: string;
        mobile: string;
      }>
    ) => {
      const { access, refresh, access_expires_at, refresh_expires_at, user_id, mobile } = action.payload;
      state.access = access;
      state.refresh = refresh;
      state.access_expires_at = access_expires_at;
      state.refresh_expires_at = refresh_expires_at;
      state.user_id = user_id;
      state.mobile = mobile;

      // Save tokens and expiration date to localStorage
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('access_expires_at', access_expires_at);
      localStorage.setItem('refresh_expires_at', refresh_expires_at);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('mobile', mobile);
    },
    logout: (state) => {
      state.access = null;
      state.refresh = null;
      state.access_expires_at = null;
      state.refresh_expires_at = null;
      state.user_id = null;
      state.mobile = null;

      // Remove tokens and expiration date from localStorage
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('access_expires_at');
      localStorage.removeItem('refresh_expires_at');
      localStorage.removeItem('user_id');
      localStorage.removeItem('mobile');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;