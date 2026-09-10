import React, { Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthPage from 'pages/AuthPage/AuthPage';
import DashboardPage from 'pages/DashboardPage';
import ErrorPage from 'pages/ErrorPage/ErrorPage';
import AuthInitializer from 'routes/AuthInitializer';
import AuthLayout from '@/layouts/AuthLayout/AuthLayout';
import { RootState, useTypedSelector } from 'store/store';
import ErrorBoundary from '@/components/hoc/ErrorBoundary';
import NotFoundPage from 'pages/NotFoundPage/NotFoundPage';
import FormBuilder from '@/components/form/formBuilder/FormBuilder';
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';

/**
 * AppRoutes Component
 *
 * This component defines the main routing structure for the application.
 * It uses React Router to manage navigation between different pages and layouts.
 *
 * @component
 *
 * @returns {React.FC} The AppRoutes component.
 *
 * @remarks
 * - The component uses `useTypedSelector` to determine if the user is authenticated.
 * - Routes are wrapped with `ErrorBoundary` and `Suspense` for error handling and lazy loading.
 *
 * @routes
 * - `/auth`: Displays the `AuthLayout` and its nested routes if the user is not authenticated.
 *   - Nested route:
 *     - `/auth` (index): Renders the `AuthPage` component.
 * - `/`: Displays the `DashboardLayout` and its nested routes if the user is authenticated.
 *   - Nested route:
 *     - `/` (index): Renders the `DashboardPage` component.
 * - `/error`: Renders the `ErrorPage` component.
 * - `*`: Renders the `NotFoundPage` component for unmatched routes.
 *
 * @dependencies
 * - `useTypedSelector`: Custom hook to access the Redux store's state.
 * - `Router`, `Routes`, `Route`, `Navigate`: React Router components for navigation.
 * - `ErrorBoundary`: Component for handling runtime errors.
 * - `Suspense`: React component for lazy loading fallback.
 * - `AuthLayout`, `DashboardLayout`, `AuthPage`, `DashboardPage`, `ErrorPage`, `NotFoundPage`: Custom components for different layouts and pages.
 */
const AppRoutes: React.FC = () => {
    const isAuthenticated = useTypedSelector((state: RootState) => state.auth.isAuthenticated);

    return (
        <Router>
            <AuthInitializer> 
                <ErrorBoundary>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            {/* Auth Layout with Nested Routes */}
                            <Route
                                path="/auth"
                                element={
                                    isAuthenticated ? (
                                        <Navigate to="/" replace />
                                    ) : (
                                        <AuthLayout />
                                    )
                                }
                            >
                                <Route index element={<AuthPage />} />
                            </Route>

                            {/* Dashboard Layout with Nested Routes */}
                            <Route
                                path="/"
                                element={
                                    isAuthenticated ? (
                                        <ProtectedRoute>
                                            <DashboardLayout />
                                        </ProtectedRoute>
                                    ) : (
                                        <Navigate to="/auth" replace />
                                    )
                                }
                            >
                                <Route index element={<DashboardPage />} />
                                <Route path="/users/*" element={<FormBuilder entity="users" />} />
                            </Route>
                            <Route
                                path="/dashboard"
                                element={<DashboardLayout /> }
                            >
                                <Route index element={<DashboardPage />} />
                                <Route path="users/*" element={<FormBuilder entity="users" />} />
                            </Route>

                            {/* Error Page */}
                            <Route path="/error" element={<ErrorPage />} />

                            {/* 404 Page */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </AuthInitializer>
        </Router>
    );
};

export default AppRoutes;