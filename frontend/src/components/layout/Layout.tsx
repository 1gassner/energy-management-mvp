import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import PublicHeader from './PublicHeader';
import { useAuthStore } from '@/stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // Routes that should show public header
  const publicRoutes = ['/public', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Routes that should show no header (like health check)
  const noHeaderRoutes = ['/health'];
  const shouldShowNoHeader = noHeaderRoutes.includes(location.pathname);

  if (shouldShowNoHeader) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? <Header /> : isPublicRoute && <PublicHeader />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;