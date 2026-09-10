import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expirationDate: string | null;
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string } | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  expirationDate: localStorage.getItem('expirationDate'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expirationDate: string;
        user: { id: string; name: string; email: string };
      }>
    ) => {
      const { accessToken, refreshToken, expirationDate, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.expirationDate = expirationDate;
      state.isAuthenticated = true;
      state.user = user;

      // Save tokens and expiration date to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('expirationDate', expirationDate);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expirationDate = null;
      state.isAuthenticated = false;
      state.user = null;

      // Remove tokens and expiration date from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('expirationDate');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;