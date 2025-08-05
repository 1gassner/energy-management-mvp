import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { PermissionService, UserRole, Permission } from '@/types/permissions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load components
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const SecureLogin = lazy(() => import('@/components/auth/SecureLogin'));
const SecureRegister = lazy(() => import('@/components/auth/SecureRegister'));
const PublicDemo = lazy(() => import('@/pages/public/PublicDemo'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const CityEnergyDashboard = lazy(() => import('@/pages/CityEnergyDashboard'));
const BuergerDashboard = lazy(() => import('@/pages/public/BuergerDashboard'));

// Building Dashboards
const RathausDashboard = lazy(() => import('@/pages/buildings/RathausDashboard'));
const RealschuleDashboard = lazy(() => import('@/pages/buildings/RealschuleDashboard'));
const GrundschuleDashboard = lazy(() => import('@/pages/buildings/GrundschuleDashboard'));
const HallenbadDashboard = lazy(() => import('@/pages/buildings/HallenbadDashboard'));
const GymnasiumDashboard = lazy(() => import('@/pages/buildings/GymnasiumDashboard'));
const WerkrealschuleDashboard = lazy(() => import('@/pages/buildings/WerkrealschuleDashboard'));
const SporthallenDashboard = lazy(() => import('@/pages/buildings/SporthallenDashboard'));

// Hechingen Overview
const HechingenOverview = lazy(() => import('@/pages/dashboard/HechingenOverview'));

// Alert Components
const AlertsDashboard = lazy(() => import('@/pages/alerts/AlertsDashboard'));
const ActiveAlerts = lazy(() => import('@/pages/alerts/ActiveAlerts'));

// Analytics Components
const AIAnalyticsDashboard = lazy(() => import('@/pages/analytics/AIAnalyticsDashboard'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/pages/analytics/AdvancedAnalyticsDashboard'));

// Admin Components
const SensorManagement = lazy(() => import('@/pages/admin/SensorManagement'));
const DeviceManagement = lazy(() => import('@/pages/admin/DeviceManagement'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));

// Maintenance Components
const MaintenanceScheduler = lazy(() => import('@/pages/maintenance/MaintenanceScheduler'));

// Reports Components
const ReportsManagement = lazy(() => import('@/pages/reports/ReportsManagement'));

// Optimization Components
const EnergyOptimizationEngine = lazy(() => import('@/pages/optimization/EnergyOptimizationEngine'));

// Finance Components  
const BudgetManagement = lazy(() => import('@/pages/finance/BudgetManagement'));

// Planning Components
const MobileAppPlan = lazy(() => import('@/pages/planning/MobileAppPlan'));

// System Components
const HealthCheck = lazy(() => import('@/components/HealthCheck'));

// Protected Route Component with Enhanced Permission System
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  roles?: string[];
  requirePermission?: Permission;
}> = ({ 
  children, 
  roles = [],
  requirePermission
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/secure-login" replace />;
  }
  
  // Check role-based access
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Check permission-based access
  if (requirePermission && user?.role) {
    const hasPermission = PermissionService.hasPermission(user.role as UserRole, requirePermission);
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

// Default Redirect Component
const DefaultRedirect: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return <Navigate to={isAuthenticated ? "/dashboard" : "/secure-login"} replace />;
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
      
      {/* Public Routes - Homepage redirects to BuergerDashboard */}
      <Route path="/" element={
        <Suspense fallback={<LoadingSpinner />}>
          <BuergerDashboard />
        </Suspense>
      } />
      <Route path="/demo" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PublicDemo />
        </Suspense>
      } />
      {/* Legacy Auth Routes (redirect to secure versions) */}
      <Route path="/login" element={<Navigate to="/secure-login" replace />} />
      <Route path="/register" element={<Navigate to="/secure-register" replace />} />
      
      {/* Secure Auth Routes */}
      <Route path="/secure-login" element={
        <Suspense fallback={<LoadingSpinner />}>
          <SecureLogin />
        </Suspense>
      } />
      <Route path="/secure-register" element={
        <Suspense fallback={<LoadingSpinner />}>
          <SecureRegister />
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
            <CityEnergyDashboard />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Hechingen Overview */}
      <Route path="/hechingen" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <HechingenOverview />
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
      <Route path="/buildings/hallenbad" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <HallenbadDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/buildings/gymnasium" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <GymnasiumDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/buildings/werkrealschule" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <WerkrealschuleDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/buildings/sporthallen" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <SporthallenDashboard />
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
      <Route path="/analytics" element={
        <ProtectedRoute roles={['admin', 'buergermeister', 'manager', 'gebaeudemanager']} requirePermission={Permission.VIEW_DETAILED_ANALYTICS}>
          <Suspense fallback={<LoadingSpinner />}>
            <AdvancedAnalyticsDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
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
      <Route path="/admin/sensors" element={
        <ProtectedRoute roles={['admin']}>
          <Suspense fallback={<LoadingSpinner />}>
            <SensorManagement />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/buildings" element={
        <ProtectedRoute roles={['admin']}>
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/devices" element={
        <ProtectedRoute roles={['admin', 'gebaeudemanager']}>
          <Suspense fallback={<LoadingSpinner />}>
            <DeviceManagement />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Maintenance Routes */}
      <Route path="/maintenance" element={
        <ProtectedRoute roles={['admin', 'gebaeudemanager']}>
          <Suspense fallback={<LoadingSpinner />}>
            <MaintenanceScheduler />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Reports Routes */}
      <Route path="/reports" element={
        <ProtectedRoute roles={['admin', 'buergermeister', 'manager']}>
          <Suspense fallback={<LoadingSpinner />}>
            <ReportsManagement />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Optimization Routes */}
      <Route path="/optimization" element={
        <ProtectedRoute roles={['admin', 'buergermeister', 'manager', 'gebaeudemanager']} requirePermission={Permission.VIEW_DETAILED_ANALYTICS}>
          <Suspense fallback={<LoadingSpinner />}>
            <EnergyOptimizationEngine />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Finance Routes */}
      <Route path="/budget" element={
        <ProtectedRoute roles={['admin', 'buergermeister', 'manager']} requirePermission={Permission.VIEW_DETAILED_ANALYTICS}>
          <Suspense fallback={<LoadingSpinner />}>
            <BudgetManagement />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Profile Route */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Profil</h1>
              <p>Profilseite wird implementiert...</p>
            </div>
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Settings Route */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Einstellungen</h1>
              <p>Einstellungsseite wird implementiert...</p>
            </div>
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Planning Routes */}
      <Route path="/planning/mobile-app" element={
        <ProtectedRoute roles={['admin', 'buergermeister', 'manager']}>
          <Suspense fallback={<LoadingSpinner />}>
            <MobileAppPlan />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
};

export default Router; 