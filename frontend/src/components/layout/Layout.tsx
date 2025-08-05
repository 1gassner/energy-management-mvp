import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import EcoHeader from './EcoHeader';
import PublicHeader from './PublicHeader';
import EcoPublicHeader from './EcoPublicHeader';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import AnimatedBackground from '../ui/AnimatedBackground';
import { useAuthStore } from '@/stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [useEcoTheme, setUseEcoTheme] = useState(true); // Enable eco theme by default
  
  // Routes that should show public header
  const publicRoutes = ['/', '/demo', '/public', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Routes that should show no header (like health check)
  const noHeaderRoutes = ['/health'];
  const shouldShowNoHeader = noHeaderRoutes.includes(location.pathname);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState));
    }
    
    // Load eco theme preference
    const ecoThemeState = localStorage.getItem('useEcoTheme');
    if (ecoThemeState !== null) {
      setUseEcoTheme(JSON.parse(ecoThemeState));
    }
  }, []);

  // Save sidebar state to localStorage
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  if (shouldShowNoHeader) {
    return <>{children}</>;
  }

  // Public layout without sidebar - Eco Theme
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background for public pages */}
        <AnimatedBackground variant="particles" intensity="low" />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Use EcoPublicHeader with eco styling */}
          {isPublicRoute && <EcoPublicHeader />}
          <main className="flex-1 pt-20">
            {children}
          </main>
          {/* Footer with eco styling */}
          <Footer />
        </div>
      </div>
    );
  }

  // Authenticated layout with eco theme
  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background for authenticated users */}
      <AnimatedBackground variant="mesh" intensity="low" />
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Use EcoHeader instead of regular Header */}
        <EcoHeader onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
        
        <div className="flex flex-1 overflow-hidden pt-20">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar 
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
            />
          </div>
          
          {/* Mobile Sidebar */}
          <MobileSidebar 
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />
          
          <main className="flex-1 overflow-y-auto relative">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Layout;