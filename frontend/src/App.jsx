import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './layouts/MainLayout';
import {
  Login,
  Signup,
  ForgotPassword,
  Dashboard,
  Equipment,
  EquipmentDetail,
  EquipmentCategories,
  WorkCenters,
  Teams,
  TeamDetail,
  MaintenanceRequests,
  Calendar,
  Profile,
  Settings,
} from './pages';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="equipment/:id" element={<EquipmentDetail />} />
        <Route path="equipment-categories" element={<EquipmentCategories />} />
        <Route path="work-centers" element={<WorkCenters />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamDetail />} />
        <Route path="maintenance" element={<MaintenanceRequests />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
