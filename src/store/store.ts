/**
 * Redux store configuration with persistence and middleware setup.
 * 
 * This file sets up the Redux store for the application, including:
 * - Combining reducers for different slices of state.
 * - Configuring redux-persist to persist specific slices of the state.
 * - Adding middleware for handling API calls and custom logic.
 * - Enabling Redux DevTools in non-production environments.
 * - Providing typed hooks for dispatch and selector usage.
 * 
 * Key Features:
 * - `auth` slice is persisted using `redux-persist`.
 * - API slice (`api.reducerPath`) is excluded from persistence.
 * - Middleware includes default middleware, API middleware, and custom `authMiddleware`.
 * - Listeners are set up for RTK Query to enable automatic refetching and caching.
 * 
 * Exports:
 * - `store`: The configured Redux store.
 * - `persistor`: The persistor instance for managing persisted state.
 * - `RootState`: Type representing the root state of the store.
 * - `AppDispatch`: Type representing the dispatch function of the store.
 * - `useTypedDispatch`: Typed hook for dispatching actions.
 * - `useTypedSelector`: Typed hook for selecting state.
 */
import api from 'features/api/api';
import storage from 'redux-persist/lib/storage';
import authReducer from 'features/auth/authSlice';
import { entityApi } from 'features/api/entityApi';
import userReducer from 'features/users/userSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import { authMiddleware } from 'features/auth/authMiddleware';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer, // Persist this slice
  users: userReducer,
  [api.reducerPath]: api.reducer,
  [entityApi.reducerPath]: entityApi.reducer,
});

// Configure redux-persist
/**
 * Configuration object for Redux Persist.
 * 
 * @property {string} key - The key used to identify the root of the persisted state.
 * @property {Storage} storage - The storage engine to use for persisting data (e.g., localStorage or AsyncStorage).
 * @property {string[]} whitelist - An array of reducer names to persist. Only the specified slices of the state will be persisted.
 * 
 * In this configuration, only the `auth` slice of the state will be persisted.
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist the auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }).concat(api.middleware, entityApi.middleware, authMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable listeners for RTK Query
setupListeners(store.dispatch);

// Persistor for the store
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Export hooks
export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
