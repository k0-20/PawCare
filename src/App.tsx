import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyPetsPage } from '@/pages/MyPetsPage';
import { MedicalRecordsPage } from '@/pages/MedicalRecordsPage';
import { PreventiveCarePage } from '@/pages/PreventiveCarePage';
import { HealthAlertsPage } from '@/pages/HealthAlertsPage';
import { VeterinaryClinicsPage } from '@/pages/VeterinaryClinicsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pets" element={<MyPetsPage />} />
            <Route path="medical-records" element={<MedicalRecordsPage />} />
            <Route path="preventive-care" element={<PreventiveCarePage />} />
            <Route path="health-alerts" element={<HealthAlertsPage />} />
            <Route path="clinics" element={<VeterinaryClinicsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
