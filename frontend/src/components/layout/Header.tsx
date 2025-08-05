import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LogOut, User, Bell, ChevronDown, Building, Cog, Menu, 
  Search, Globe, Zap, Home, BarChart3, Settings,
  Compass, Star, Sparkles, ArrowRight, ChevronRight 
} from 'lucide-react';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import { PermissionService, UserRole, Permission } from '@/types/permissions';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showBuildingsDropdown, setShowBuildingsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Add scroll effect for mobile header
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside - MUST be before conditional return
  React.useEffect(() => {
    if (!user) return; // Early return if no user
    
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
  const canGenerateReports = PermissionService.hasPermission(userRole, Permission.GENERATE_REPORTS);
  const canControlSensors = PermissionService.hasPermission(userRole, Permission.CONTROL_SENSORS);

  // Streamlined navigation items - prioritized for better UX
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Energie', href: '/energy-flow', icon: 'zap' },
    { name: 'Alerts', href: '/alerts', icon: 'alert' },
    ...(canViewAnalytics ? [{ name: 'Analytics', href: '/analytics/ai', icon: 'chart' }] : []),
    ...(canViewAnalytics ? [{ name: 'Budget', href: '/budget', icon: 'euro' }] : []),
    ...(canManageSystem ? [{ name: 'Admin', href: '/admin', icon: 'settings' }] : []),
  ];

  // Building navigation items
  const buildingItems = [
    { name: 'Rathaus Hechingen', href: '/buildings/rathaus' },
    { name: 'Realschule Hechingen', href: '/buildings/realschule' },
    { name: 'Grundschule Hechingen', href: '/buildings/grundschule' },
    { name: 'Hallenbad Hechingen', href: '/buildings/hallenbad' },
    { name: 'Gymnasium Hechingen', href: '/buildings/gymnasium' },
    { name: 'Werkrealschule Hechingen', href: '/buildings/werkrealschule' },
    { name: 'Sporthallen Hechingen', href: '/buildings/sporthallen' },
  ];

  // Mock notifications - similar to CityPulse
  const mockNotifications = [
    { id: 1, title: 'Hoher Energieverbrauch', message: 'Rathaus Hechingen Heizung', time: '5 min' },
    { id: 2, title: 'Wartung fällig', message: 'Hallenbad Hechingen Lüftung', time: '1 Std' },
    { id: 3, title: 'Optimierung verfügbar', message: 'Realschule Hechingen Beleuchtung', time: '2 Std' },
  ];

  // Smart breadcrumb generation
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
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
      'glass-nav glass-nav-hechingen shadow-2xl transition-all duration-300',
      'border-b-2 border-hechingen-blue-500/20 backdrop-blur-xl',
      'bg-gradient-to-r from-slate-900/95 via-blue-900/90 to-indigo-900/95',
      'relative overflow-hidden',
      isScrolled && 'shadow-2xl bg-slate-900/98 backdrop-blur-2xl'
    )}>
      {/* Dynamic background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Mobile menu button + Modern Logo */}
          <div className="flex items-center flex-shrink-0">
            {onMobileMenuToggle && (
              <button
                type="button"
                className={cn(
                  "md:hidden p-3 rounded-2xl mr-3 transition-all duration-300",
                  "glass-button-secondary shadow-lg hover:scale-110 hover:rotate-180",
                  "focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                )}
                onClick={onMobileMenuToggle}
              >
                <span className="sr-only">Navigation öffnen</span>
                <Menu className="h-6 w-6 text-white" />
              </button>
            )}
            
            <Link to="/dashboard" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 glass-card-hechingen-primary rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent">
                  CityPulse Hechingen
                </h1>
                <p className="text-sm text-blue-200/80 font-medium">Smart Energy Portal 3.0 • Live</p>
              </div>
            </Link>
          </div>

          {/* Modern Navigation with Breadcrumbs */}
          <div className="hidden md:flex flex-col justify-center flex-1 max-w-4xl mx-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 mb-2">
              <Compass className="w-4 h-4 text-blue-300" />
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <Link
                    to={crumb.href}
                    className={cn(
                      "text-sm font-medium transition-all duration-200",
                      index === breadcrumbs.length - 1
                        ? "text-white"
                        : "text-blue-200/70 hover:text-white hover:scale-105"
                    )}
                  >
                    {crumb.name}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-blue-300/50" />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Main Navigation */}
            <nav className="flex space-x-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href.startsWith('/analytics') && location.pathname.startsWith('/analytics'));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300",
                      "hover:transform hover:scale-105 hover:shadow-lg",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-white backdrop-blur-xl border border-blue-400/30 shadow-lg"
                        : "text-blue-200 hover:text-white hover:bg-white/10 hover:backdrop-blur-xl"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Enhanced Buildings Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowBuildingsDropdown(!showBuildingsDropdown);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && showBuildingsDropdown) {
                      setShowBuildingsDropdown(false);
                    }
                    if (e.key === 'ArrowDown' && !showBuildingsDropdown) {
                      e.preventDefault();
                      setShowBuildingsDropdown(true);
                    }
                  }}
                  aria-expanded={showBuildingsDropdown}
                  aria-haspopup="menu"
                  aria-label="Gebäude auswählen"
                  id="buildings-menu-button"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300",
                    "hover:transform hover:scale-105 hover:shadow-lg buildings-button focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
                    location.pathname.startsWith('/buildings')
                      ? "bg-gradient-to-r from-emerald-500/30 to-green-600/30 text-white backdrop-blur-xl border border-emerald-400/30 shadow-lg"
                      : "text-blue-200 hover:text-white hover:bg-white/10 hover:backdrop-blur-xl"
                  )}
                >
                  <Building className="h-4 w-4" />
                  <span>Gebäude</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    showBuildingsDropdown && "rotate-180"
                  )} />
                </button>

                {/* Modern Buildings Dropdown Menu */}
                {showBuildingsDropdown && (
                  <div 
                    role="menu"
                    aria-labelledby="buildings-menu-button"
                    className="absolute left-0 mt-3 w-80 glass-card-medium rounded-2xl shadow-2xl border border-white/20 z-50 buildings-dropdown backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowBuildingsDropdown(false);
                        document.getElementById('buildings-menu-button')?.focus();
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10">
                        <Building className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm font-bold text-white">Gebäude Hechingen</p>
                          <p className="text-xs text-blue-200/60">{buildingItems.length} kommunale Einrichtungen</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-2" role="group" aria-label="Gebäude Liste">
                        {buildingItems.map((building, index) => (
                          <Link
                            key={building.name}
                            to={building.href}
                            role="menuitem"
                            className={cn(
                              "flex items-center px-4 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer",
                              "hover:transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
                              location.pathname === building.href
                                ? "bg-gradient-to-r from-emerald-500/20 to-green-600/20 text-white border border-emerald-400/30"
                                : "text-blue-200 hover:text-white hover:bg-white/10 hover:backdrop-blur-xl"
                            )}
                            onClick={() => {
                              setShowBuildingsDropdown(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setShowBuildingsDropdown(false);
                                navigate(building.href);
                              }
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const nextItem = e.currentTarget.parentElement?.children[index + 1] as HTMLElement;
                                nextItem?.focus();
                              }
                              if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prevItem = e.currentTarget.parentElement?.children[index - 1] as HTMLElement;
                                prevItem?.focus();
                              }
                            }}
                            tabIndex={0}
                            aria-label={`${building.name} - Smart Building online`}
                          >
                            <Building className="h-5 w-5 mr-3 opacity-70" />
                            <div className="flex-1">
                              <div className="font-medium">{building.name}</div>
                              <div className="text-xs opacity-60">Smart Building • Online</div>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Enhanced Action Controls */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Smart Search - Desktop only */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  className="pl-10 pr-4 py-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-blue-200/60 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                />
              </div>
            </div>
            
            {/* Enhanced Connection Status */}
            <div className="flex items-center space-x-2">
              <ConnectionStatus showText={false} className="bg-white/10 backdrop-blur-xl rounded-xl p-2" />
            </div>

            {/* Enhanced Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && showNotifications) {
                    setShowNotifications(false);
                  }
                }}
                aria-expanded={showNotifications}
                aria-haspopup="menu"
                aria-label={`Benachrichtigungen ${mockNotifications.length > 0 ? `(${mockNotifications.length} neue)` : ''}`}
                id="notifications-menu-button"
                className={cn(
                  "relative p-3 rounded-2xl transition-all duration-300 notification-button",
                  "glass-button-secondary shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                  showNotifications && "bg-blue-500/20 scale-110"
                )}
              >
                <Bell className="h-5 w-5 text-white" />
                {mockNotifications.length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {mockNotifications.length}
                    </span>
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full animate-ping opacity-30" />
                  </>
                )}
              </button>

              {/* Modern Notifications Dropdown */}
              {showNotifications && (
                <div 
                  role="menu"
                  aria-labelledby="notifications-menu-button"
                  className="absolute right-0 mt-3 w-96 glass-card-medium rounded-2xl shadow-2xl border border-white/20 z-50 notification-dropdown backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowNotifications(false);
                      document.getElementById('notifications-menu-button')?.focus();
                    }
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Benachrichtigungen</h3>
                      </div>
                      <div className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                        {mockNotifications.length} Neu
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" 
                         role="group" 
                         aria-label="Liste der Benachrichtigungen">
                      {mockNotifications.map((notification, index) => (
                        <div 
                          key={notification.id} 
                          className="glass-card-light p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all duration-300 group focus-within:ring-2 focus-within:ring-blue-400/50"
                          role="menuitem"
                          tabIndex={0}
                          aria-label={`${notification.title}: ${notification.message}, vor ${notification.time}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white mb-1">{notification.title}</p>
                              <p className="text-sm text-blue-200/80 mb-2">{notification.message}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                <span className="text-xs text-blue-300">vor {notification.time}</span>
                              </div>
                            </div>
                            <button 
                              className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                              aria-label={`${notification.title} markieren`}
                              tabIndex={0}
                            >
                              <Star className="w-4 h-4 text-blue-300" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <Link
                        to="/alerts"
                        className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white rounded-2xl hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        onClick={() => setShowNotifications(false)}
                        role="menuitem"
                        aria-label="Alle Benachrichtigungen anzeigen"
                      >
                        <span>Alle Benachrichtigungen anzeigen</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced User Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && showUserMenu) {
                    setShowUserMenu(false);
                  }
                }}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                aria-label={`Benutzermenü für ${user.name}`}
                id="user-menu-button"
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 user-button",
                  "glass-button-secondary shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                  showUserMenu && "bg-blue-500/20 scale-105"
                )}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-blue-200/60 capitalize">{user.role}</div>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-blue-300 transition-transform duration-300",
                  showUserMenu && "rotate-180"
                )} />
              </button>

              {/* Modern User Dropdown */}
              {showUserMenu && (
                <div 
                  role="menu"
                  aria-labelledby="user-menu-button"
                  className="absolute right-0 mt-3 w-64 glass-card-medium rounded-2xl shadow-2xl border border-white/20 z-50 user-dropdown backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowUserMenu(false);
                      document.getElementById('user-menu-button')?.focus();
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-4 px-4 py-4 border-b border-white/10">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-white">{user.name}</p>
                        <p className="text-sm text-blue-300 capitalize font-medium">{user.role}</p>
                        <p className="text-xs text-blue-200/60">Online • Aktiv</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2" role="group" aria-label="Benutzermenü">
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex items-center px-4 py-3 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        onClick={() => setShowUserMenu(false)}
                        aria-label="Profil anzeigen"
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span className="font-medium">Profil</span>
                        <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
                      </Link>
                      <Link
                        to="/settings"
                        role="menuitem"
                        className="flex items-center px-4 py-3 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        onClick={() => setShowUserMenu(false)}
                        aria-label="Einstellungen öffnen"
                      >
                        <Cog className="h-5 w-5 mr-3" />
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
                        role="menuitem"
                        className="flex items-center w-full px-4 py-3 text-sm text-blue-200 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-red-400/50"
                        aria-label="Aus dem System abmelden"
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

export default Header;