/**
 * This module defines an API service using Redux Toolkit's `createApi` function.
 * It is configured to handle API requests with a base URL and authorization headers.
 *
 * @module api
 */

 /**
  * Creates an API service with the following configurations:
  * 
  * - `reducerPath`: Specifies the key in the Redux store where the API state will be stored.
  * - `baseQuery`: Configures the base query for API requests using `fetchBaseQuery`.
  *   - `baseUrl`: The base URL for API requests, which defaults to the value of the `VITE_API_BASE_URL` environment variable or `/api`.
  *   - `prepareHeaders`: A function to prepare headers for each request. It retrieves a token from `localStorage` and sets it as the `Authorization` header if available.
  * - `tagTypes`: Defines tags for caching and invalidation, including `Auth`, `User`, and `Product`.
  * - `endpoints`: A placeholder function for defining API endpoints.
  *
  * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Documentation}
  */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VITE_API_BASE_URL || '/api',
    prepareHeaders: (headers) => {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Product'],
  endpoints: () => ({}),
});

export default api;