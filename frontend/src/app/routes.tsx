import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcePage } from './pages/ResourcePage';
import { CostInsurancePage } from './pages/CostInsurancePage';
import { PatientExperiencePage } from './pages/PatientExperiencePage';
import { SuperadminPage } from './pages/SuperadminPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { NurseDashboard } from './pages/NurseDashboard';
import { PharmacistDashboard } from './pages/PharmacistDashboard';
import { CSDashboard } from './pages/CSDashboard';

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  { path: '/superadmin', Component: SuperadminPage },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'doctor', Component: DoctorDashboard },
      { path: 'nurse', Component: NurseDashboard },
      { path: 'pharmacist', Component: PharmacistDashboard },
      { path: 'cs', Component: CSDashboard },
      { path: 'resources', Component: ResourcePage },
      { path: 'cost-insurance', Component: CostInsurancePage },
      { path: 'patient-experience', Component: PatientExperiencePage },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
