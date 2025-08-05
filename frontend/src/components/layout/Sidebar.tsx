import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  AlertTriangle,
  Users,
  Cpu,
  FileText,
  Settings,
  BarChart3,
  Zap,
  DollarSign,
  Wrench,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Activity,
  Timer,
  Compass,
  Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isBuildingsExpanded, setIsBuildingsExpanded] = useState(false);

  // Check if user has admin or manager role
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'manager';
  const hasManagerAccess = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'buergermeister';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Energiefluss', href: '/energy-flow', icon: Zap },
    { name: 'Hechingen', href: '/hechingen', icon: Building2 },
    { name: 'Wetter', href: '/weather', icon: Cloud, notification: true },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, requiresManager: true },
    { name: 'Optimierung', href: '/optimization', icon: TrendingUp, requiresManager: true },
    { name: 'Budget', href: '/budget', icon: DollarSign, requiresManager: true },
    { name: 'Wartung', href: '/maintenance', icon: Wrench, requiresAdmin: true },
    { name: 'Berichte', href: '/reports', icon: FileText, requiresManager: true },
  ];

  const adminNavigation = [
    { name: 'Geräte', href: '/admin/devices', icon: Cpu },
    { name: 'Benutzer', href: '/admin/users', icon: Users },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const buildingNavigation = [
    { name: 'Rathaus Hechingen', href: '/buildings/rathaus', icon: Building2 },
    { name: 'Realschule Hechingen', href: '/buildings/realschule', icon: Building2 },
    { name: 'Grundschule Hechingen', href: '/buildings/grundschule', icon: Building2 },
    { name: 'Werkrealschule Hechingen', href: '/buildings/werkrealschule', icon: Building2 },
    { name: 'Gymnasium Hechingen', href: '/buildings/gymnasium', icon: Building2 },
    { name: 'Hallenbad Hechingen', href: '/buildings/hallenbad', icon: Building2 },
    { name: 'Sporthallen Hechingen', href: '/buildings/sporthallen', icon: Building2 },
  ];

  // Filter navigation based on user permissions
  const filteredNavigation = navigation.filter(item => {
    if (item.requiresAdmin && !hasAdminAccess) return false;
    if (item.requiresManager && !hasManagerAccess) return false;
    return true;
  });

  // Add smart contextual highlighting based on current page
  const getContextualHighlight = (href: string) => {
    const path = location.pathname;
    if (path.startsWith('/buildings') && href.startsWith('/buildings')) return true;
    if (path.startsWith('/analytics') && href === '/analytics') return true;
    if (path.startsWith('/admin') && href.startsWith('/admin')) return true;
    return path === href;
  };

  // Add smooth scroll effect for mobile
  useEffect(() => {
    const handleScroll = () => {
      const sidebar = document.querySelector('.sidebar-container');
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.toggle('scrolled', window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderNavItem = (item: any, isSmall = false) => {
    const isActive = getContextualHighlight(item.href);
    const hasNotification = item.notification;
    
    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'group relative flex items-center rounded-2xl transition-all duration-300',
          'hover:transform hover:scale-105 hover:shadow-xl',
          isActive 
            ? 'glass-nav-item-active bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-blue-400/30 shadow-lg'
            : 'glass-nav-item hover:bg-white/10 hover:backdrop-blur-xl hover:border-white/20',
          isCollapsed ? 'justify-center p-4 mx-2' : 'px-4 py-3 mx-3',
          isSmall && 'ml-6'
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <div className={cn(
          'relative flex items-center',
          isActive && 'text-white',
          !isActive && 'text-blue-200 group-hover:text-white'
        )}>
          <div className="relative">
            <item.icon
              className={cn(
                'flex-shrink-0 transition-all duration-300',
                isSmall ? 'h-4 w-4' : 'h-5 w-5',
                isCollapsed ? 'mr-0' : 'mr-4',
                isActive && 'drop-shadow-lg',
                'group-hover:scale-110'
              )}
            />
            {hasNotification && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          
          {!isCollapsed && (
            <span className={cn(
              'font-medium transition-all duration-300',
              isActive ? 'text-white' : 'text-blue-200 group-hover:text-white',
              'group-hover:translate-x-1'
            )}>
              {item.name}
            </span>
          )}
          
          {isActive && !isCollapsed && (
            <div className="absolute right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/10 group-hover:to-purple-600/10 transition-all duration-300" />
      </Link>
    );
  };

  return (
    <div className={cn(
      'flex flex-col glass-nav glass-nav-hechingen sidebar-container',
      'border-r-2 border-hechingen-blue-500/20 shadow-2xl',
      'transition-all duration-300 ease-in-out h-full',
      'backdrop-blur-xl bg-gradient-to-b from-slate-900/95 via-blue-900/90 to-indigo-900/95',
      'relative overflow-hidden',
      isCollapsed ? 'w-20' : 'w-72 md:w-64'
    )}>
      {/* Dynamic background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Modern Header with Logo */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 glass-card-hechingen-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  CityPulse 3.0
                </h2>
                <p className="text-xs text-blue-200/60">Smart Navigation</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 glass-card-hechingen-primary rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="glass-button-secondary p-2 rounded-xl hover:scale-110 hover:rotate-180 transition-all duration-300 shadow-lg"
              title={isCollapsed ? 'Navigation erweitern' : 'Navigation zuklappen'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-blue-300" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-blue-300" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0 pt-6 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Smart Status Indicator */}
        {!isCollapsed && (
          <div className="mx-3 mb-6 p-3 glass-card-light rounded-2xl backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-400">LIVE STATUS</p>
                <p className="text-xs text-blue-200/80">Alle Systeme aktiv</p>
              </div>
            </div>
          </div>
        )}
        
        <nav className="flex-1 space-y-3">
          {/* Main Navigation with Smart Grouping */}
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-bold text-blue-300/80 uppercase tracking-wider mb-3">
                Hauptnavigation
              </h3>
            )}
            {filteredNavigation.map((item) => renderNavItem({ ...item, notification: item.href === '/alerts' }))}
          </div>

          {/* Admin Section with Enhanced Design */}
          {hasAdminAccess && (
            <div className="pt-6 mt-6 border-t border-white/10">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-bold text-purple-300/80 uppercase tracking-wider mb-3">
                  <Settings className="w-3 h-3 inline mr-2" />
                  Administration
                </h3>
              )}
              <div className="space-y-2">
                {adminNavigation.map((item) => renderNavItem(item))}
              </div>
            </div>
          )}

          {/* Buildings Section with Modern Expandable Design */}
          <div className="pt-6 mt-6 border-t border-white/10">
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => setIsBuildingsExpanded(!isBuildingsExpanded)}
                  className={cn(
                    'flex items-center justify-between w-full px-4 py-3 mx-3 rounded-2xl transition-all duration-300',
                    'hover:bg-white/10 hover:backdrop-blur-xl hover:border-white/20 hover:scale-105',
                    'text-xs font-bold text-emerald-300/80 uppercase tracking-wider',
                    isBuildingsExpanded && 'bg-white/5 backdrop-blur-xl border border-white/10'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Gebäude Hechingen</span>
                  </div>
                  <div className={cn(
                    'transition-transform duration-300',
                    isBuildingsExpanded && 'rotate-180'
                  )}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {isBuildingsExpanded && (
                  <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    {buildingNavigation.map((item) => renderNavItem(item, true))}
                  </div>
                )}
              </>
            ) : (
              // Collapsed view with smart building preview
              <div className="space-y-2">
                <div className="p-3 mx-2 glass-card-light rounded-2xl backdrop-blur-xl border border-white/10 text-center">
                  <Building2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs text-emerald-300 font-bold">{buildingNavigation.length}</div>
                </div>
                {buildingNavigation.slice(0, 2).map((item) => renderNavItem(item, true))}
              </div>
            )}
          </div>
        </nav>
        
        {/* Modern Footer with Activity Indicator */}
        <div className="relative z-10 p-4 border-t border-white/10 mt-6">
          {!isCollapsed ? (
            <div className="glass-card-light p-3 rounded-2xl backdrop-blur-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-white">System Status</span>
                </div>
                <div className="text-xs text-green-400 font-bold">98.7%</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-200/60">
                <Timer className="w-3 h-3" />
                <span>Letztes Update: vor 2 Min</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Activity className="w-5 h-5 text-green-400 mx-auto animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;