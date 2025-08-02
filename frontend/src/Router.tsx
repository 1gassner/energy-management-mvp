import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load components
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const EnergyFlowDashboard = lazy(() => import('@/pages/EnergyFlowDashboard'));
const BuergerDashboard = lazy(() => import('@/pages/public/BuergerDashboard'));

// Building Dashboards
const RathausDashboard = lazy(() => import('@/pages/buildings/RathausDashboard'));
const RealschuleDashboard = lazy(() => import('@/pages/buildings/RealschuleDashboard'));
const GrundschuleDashboard = lazy(() => import('@/pages/buildings/GrundschuleDashboard'));

// Alert Components
const AlertsDashboard = lazy(() => import('@/pages/alerts/AlertsDashboard'));
const ActiveAlerts = lazy(() => import('@/pages/alerts/ActiveAlerts'));

// Analytics Components
const AIAnalyticsDashboard = lazy(() => import('@/pages/analytics/AIAnalyticsDashboard'));

// System Components
const HealthCheck = lazy(() => import('@/components/HealthCheck'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ 
  children, 
  roles = [] 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Default Redirect Component
const DefaultRedirect: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return <Navigate to={isAuthenticated ? "/dashboard" : "/public"} replace />;
};

const Router: React.FC = () => {
  return (
    <Routes>
      {/* System Routes */}
      <Route path="/health" element={
        <Suspense fallback={<LoadingSpinner />}>
          <HealthCheck />
        </Suspense>
      } />
      
      {/* Public Routes */}
      <Route path="/login" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Register />
        </Suspense>
      } />
      <Route path="/public" element={
        <Suspense fallback={<LoadingSpinner />}>
          <BuergerDashboard />
        </Suspense>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        </ProtectedRoute>
      } />

      <Route path="/energy-flow" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <EnergyFlowDashboard />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Building Routes */}
      <Route path="/buildings/rathaus" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <RathausDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/buildings/realschule" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <RealschuleDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/buildings/grundschule" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <GrundschuleDashboard />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Alert Routes */}
      <Route path="/alerts" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <AlertsDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/alerts/active" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveAlerts />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Analytics Routes */}
      <Route path="/analytics/ai" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <AIAnalyticsDashboard />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
};

export default Router; 