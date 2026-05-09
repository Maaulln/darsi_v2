import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcePage } from './pages/ResourcePage';
import { CostInsurancePage } from './pages/CostInsurancePage';
import { PatientExperiencePage } from './pages/PatientExperiencePage';
import { SuperadminPage } from './pages/SuperadminPage';

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  { path: '/superadmin', Component: SuperadminPage },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'resources', Component: ResourcePage },
      { path: 'cost-insurance', Component: CostInsurancePage },
      { path: 'patient-experience', Component: PatientExperiencePage },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
