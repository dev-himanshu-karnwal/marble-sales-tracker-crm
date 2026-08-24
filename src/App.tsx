import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AppContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import LeaderboardPage from './pages/admin/Leaderboard';
import MapViewPage from './pages/admin/MapView';
import ArchitectsPage from './pages/admin/Architects';
import ArchitectDetailPage from './pages/admin/ArchitectDetail';
import VisitsPage from './pages/admin/Visits';
import AdminActivityPage from './pages/admin/Activity';
import MyArchitectsPage from './pages/sales/MyArchitects';
import AddArchitectPage from './pages/sales/AddArchitect';
import AddSitePage from './pages/sales/AddSite';
import CheckInPage from './pages/sales/CheckIn';
import VisitLogPage from './pages/sales/VisitLog';
import VisitHistoryPage from './pages/sales/VisitHistory';
import MyMapPage from './pages/sales/MyMap';
import SalesActivityPage from './pages/sales/Activity';

function RequireRole({
  role,
  children,
}: {
  role: 'admin' | 'salesperson';
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) {
    return (
      <Navigate to={user.role === 'admin' ? '/admin' : '/sales'} replace />
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AppLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="map" element={<MapViewPage />} />
        <Route path="timeline" element={<AdminActivityPage />} />
        <Route path="architects" element={<ArchitectsPage />} />
        <Route path="architects/:id" element={<ArchitectDetailPage />} />
        <Route path="visits" element={<VisitsPage />} />
      </Route>

      <Route
        path="/sales"
        element={
          <RequireRole role="salesperson">
            <AppLayout />
          </RequireRole>
        }
      >
        <Route index element={<MyArchitectsPage />} />
        <Route path="map" element={<MyMapPage />} />
        <Route path="timeline" element={<SalesActivityPage />} />
        <Route path="add" element={<AddArchitectPage />} />
        <Route path="architects/:id" element={<ArchitectDetailPage />} />
        <Route path="architects/:id/add-site" element={<AddSitePage />} />
        <Route path="checkin/:type/:id" element={<CheckInPage />} />
        <Route path="visit/:type/:id" element={<VisitLogPage />} />
        <Route path="history" element={<VisitHistoryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
