import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/login/LoginPage';
import { SchemePage } from '@/pages/simulation/SchemePage';
import { OptimizationPage } from '@/pages/simulation/OptimizationPage';
import { EnvironmentResourcePage } from '@/pages/environment/EnvironmentResourcePage';
import { ModelConfigPage } from '@/pages/model/ModelConfigPage';
import { SystemPage } from '@/pages/system/SystemPage';
import { NotFoundPage } from '@/pages/common/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/simulation/scheme" replace /> },
      { path: 'simulation/scheme', element: <SchemePage /> },
      { path: 'simulation/optimization', element: <OptimizationPage /> },
      { path: 'environment/:resourceType', element: <EnvironmentResourcePage /> },
      { path: 'model/:modelType', element: <ModelConfigPage /> },
      { path: 'system/:section', element: <SystemPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
