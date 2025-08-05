import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LogOut, User, Bell, ChevronDown, Building, Menu, 
  Search, Zap, Home, BarChart3, Settings, Sparkles,
  ArrowRight, ChevronRight, Compass, Star, Leaf,
  Shield, AlertTriangle, Wifi, WifiOff
} from 'lucide-react';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import { PermissionService, UserRole, Permission } from '@/types/permissions';
import { cn } from '@/lib/utils';

interface EcoHeaderProps {
  onMobileMenuToggle?: () => void;
}

const EcoHeader: React.FC<EcoHeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showBuildingsDropdown, setShowBuildingsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Scroll effect für Header-Glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Online/Offline Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!user) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
      if (!target.closest('.user-dropdown') && !target.closest('.user-button')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.buildings-dropdown') && !target.closest('.buildings-button')) {
        setShowBuildingsDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const handleLogout = () => {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  // Get user permissions
  const userRole = user.role as UserRole;
  const canViewAnalytics = PermissionService.hasPermission(userRole, Permission.VIEW_DETAILED_ANALYTICS);
  const canManageSystem = PermissionService.hasPermission(userRole, Permission.SYSTEM_SETTINGS);

  // Eco-Navigation items
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'emerald' },
    { name: 'Energie', href: '/energy-flow', icon: Zap, color: 'blue' },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, color: 'orange' },
    ...(canViewAnalytics ? [{ name: 'Analytics', href: '/analytics/ai', icon: BarChart3, color: 'purple' }] : []),
    ...(canViewAnalytics ? [{ name: 'Budget', href: '/budget', icon: Leaf, color: 'green' }] : []),
    ...(canManageSystem ? [{ name: 'Admin', href: '/admin', icon: Settings, color: 'slate' }] : []),
  ];

  // Building navigation items
  const buildingItems = [
    { name: 'Rathaus Hechingen', href: '/buildings/rathaus', status: 'optimal', efficiency: '95%' },
    { name: 'Realschule Hechingen', href: '/buildings/realschule', status: 'good', efficiency: '87%' },
    { name: 'Grundschule Hechingen', href: '/buildings/grundschule', status: 'warning', efficiency: '73%' },
    { name: 'Hallenbad Hechingen', href: '/buildings/hallenbad', status: 'optimal', efficiency: '91%' },
    { name: 'Gymnasium Hechingen', href: '/buildings/gymnasium', status: 'good', efficiency: '78%' },
    { name: 'Werkrealschule Hechingen', href: '/buildings/werkrealschule', status: 'good', efficiency: '81%' },
    { name: 'Sporthallen Hechingen', href: '/buildings/sporthallen', status: 'optimal', efficiency: '82%' },
  ];

  // Smart notifications mit eco-relevanten Daten
  const ecoNotifications = [
    { 
      id: 1, 
      title: 'Energiespitze erkannt', 
      message: 'Rathaus Hechingen - Heizung läuft über Optimum', 
      time: '3 min', 
      type: 'warning',
      impact: 'Hoch'
    },
    { 
      id: 2, 
      title: 'CO₂-Ziel erreicht', 
      message: 'Hallenbad - Monatliche Reduktion 12% über Plan', 
      time: '1 Std', 
      type: 'success',
      impact: 'Positiv'
    },
    { 
      id: 3, 
      title: 'Smart Optimierung', 
      message: 'Realschule - Beleuchtung automatisch angepasst', 
      time: '2 Std', 
      type: 'info',
      impact: 'Medium'
    },
  ];

  // Smart breadcrumb generation
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }];
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      if (segment !== 'dashboard') {
        breadcrumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      'backdrop-blur-2xl border-b border-white/10',
      isScrolled 
        ? 'bg-slate-900/95 shadow-2xl shadow-emerald-500/10' 
        : 'bg-slate-900/80'
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu + Eco Logo */}
          <div className="flex items-center flex-shrink-0">
            {onMobileMenuToggle && (
              <button
                type="button"
                className="md:hidden eco-button secondary mr-3 p-3 !rounded-2xl"
                onClick={onMobileMenuToggle}
                aria-label="Navigation öffnen"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            
            <Link to="/dashboard" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 eco-card rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                  <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                <div className={cn(
                  "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-300",
                  isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                )} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CityPulse Hechingen
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-400 font-medium">Eco Smart Portal 3.0</p>
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <Wifi className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-400" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      isOnline ? "text-emerald-400" : "text-red-400"
                    )}>
                      {isOnline ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Eco Navigation with Breadcrumbs */}
          <div className="hidden md:flex flex-col justify-center flex-1 max-w-4xl mx-8">
            {/* Smart Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 mb-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <Link
                    to={crumb.href}
                    className={cn(
                      "text-sm font-medium transition-all duration-200 hover:scale-105",
                      index === breadcrumbs.length - 1
                        ? "text-white"
                        : "text-slate-400 hover:text-emerald-400"
                    )}
                  >
                    {crumb.name}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Main Eco Navigation */}
            <nav className="flex space-x-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href.startsWith('/analytics') && location.pathname.startsWith('/analytics'));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300",
                      "hover:transform hover:scale-105",
                      isActive
                        ? "eco-card bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-white border-emerald-400/30"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Enhanced Buildings Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBuildingsDropdown(!showBuildingsDropdown)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300",
                    "hover:transform hover:scale-105 buildings-button focus:outline-none",
                    location.pathname.startsWith('/buildings')
                      ? "eco-card bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white border-emerald-400/30"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                  aria-label="Gebäude auswählen"
                >
                  <Building className="h-4 w-4" />
                  <span>Gebäude</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    showBuildingsDropdown && "rotate-180"
                  )} />
                </button>

                {/* Modern Buildings Dropdown */}
                {showBuildingsDropdown && (
                  <div className="absolute left-0 mt-3 w-96 eco-card rounded-2xl shadow-2xl border border-white/20 z-50 buildings-dropdown backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300">
                    <div className="p-6">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 mb-4">
                        <div className="w-10 h-10 eco-card rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                          <Building className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Smart Buildings Hechingen</p>
                          <p className="text-xs text-slate-400">{buildingItems.length} Einrichtungen • Alle online</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {buildingItems.map((building) => (
                          <Link
                            key={building.name}
                            to={building.href}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer",
                              "hover:transform hover:scale-105 hover:bg-white/10",
                              location.pathname === building.href
                                ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white border border-emerald-400/30"
                                : "text-slate-300 hover:text-white eco-card-solid"
                            )}
                            onClick={() => setShowBuildingsDropdown(false)}
                          >
                            <div className="flex items-center gap-3">
                              <Building className="h-5 w-5 opacity-70" />
                              <div>
                                <div className="font-medium text-sm">{building.name}</div>
                                <div className="text-xs opacity-60">Smart Building • {building.efficiency} Effizienz</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                building.status === 'optimal' ? "bg-emerald-400" :
                                building.status === 'good' ? "bg-blue-400" :
                                "bg-orange-400"
                              )} />
                              <ArrowRight className="h-4 w-4 opacity-50" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Smart Search */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  className="eco-input pl-10 pr-4 py-2 w-48 text-sm"
                />
              </div>
            </div>
            
            {/* Connection Status */}
            <ConnectionStatus showText={false} className="eco-card p-2" />

            {/* Eco Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative eco-button secondary p-3 !rounded-2xl notification-button",
                  showNotifications && "scale-110"
                )}
                aria-label={`Benachrichtigungen (${ecoNotifications.length})`}
              >
                <Bell className="h-5 w-5" />
                {ecoNotifications.length > 0 && (
                  <>
                    <span className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {ecoNotifications.length}
                    </span>
                  </>
                )}
              </button>

              {/* Modern Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 eco-card rounded-2xl shadow-2xl border border-white/20 z-50 notification-dropdown backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">Eco Alerts</h3>
                      </div>
                      <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                        {ecoNotifications.length} Neu
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {ecoNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="eco-card-solid p-4 rounded-2xl hover:bg-slate-700/50 transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-white">{notification.title}</p>
                                <span className={cn(
                                  "text-xs px-2 py-1 rounded-full font-medium",
                                  notification.type === 'success' ? "bg-emerald-500/20 text-emerald-300" :
                                  notification.type === 'warning' ? "bg-orange-500/20 text-orange-300" :
                                  "bg-blue-500/20 text-blue-300"
                                )}>
                                  {notification.impact}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  notification.type === 'success' ? "bg-emerald-400" :
                                  notification.type === 'warning' ? "bg-orange-400" :
                                  "bg-blue-400"
                                )} />
                                <span className="text-xs text-slate-400">vor {notification.time}</span>
                              </div>
                            </div>
                            <button className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100">
                              <Star className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <Link
                        to="/alerts"
                        className="flex items-center justify-between w-full eco-button text-center"
                        onClick={() => setShowNotifications(false)}
                      >
                        <span>Alle Benachrichtigungen</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "flex items-center space-x-3 eco-button secondary p-3 !rounded-2xl user-button",
                  showUserMenu && "scale-105"
                )}
                aria-label={`Benutzermenü für ${user.name}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-300",
                  showUserMenu && "rotate-180"
                )} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 eco-card rounded-2xl shadow-2xl border border-white/20 z-50 user-dropdown backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="p-4">
                    <div className="flex items-center space-x-4 px-4 py-4 border-b border-white/10">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-white">{user.name}</p>
                        <p className="text-sm text-emerald-300 capitalize font-medium">{user.role}</p>
                        <p className="text-xs text-slate-400">Online • Eco Mode</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:transform hover:scale-105"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span className="font-medium">Profil</span>
                        <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:transform hover:scale-105"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-5 w-5 mr-3" />
                        <span className="font-medium">Einstellungen</span>
                        <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 font-medium"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EcoHeader;