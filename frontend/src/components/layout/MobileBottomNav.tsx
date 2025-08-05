import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Zap, 
  Building, 
  BarChart3, 
  User,
  Bell,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PermissionService, UserRole, Permission } from '@/types/permissions';
import { cn } from '@/lib/utils';

const MobileBottomNav: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const userRole = user.role as UserRole;
  const canViewAnalytics = PermissionService.hasPermission(userRole, Permission.VIEW_DETAILED_ANALYTICS);

  // Eco-Navigation für Mobile
  const mobileNavItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-500'
    },
    { 
      name: 'Energie', 
      href: '/energy-flow', 
      icon: Zap,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Gebäude', 
      href: '/buildings/rathaus', 
      icon: Building,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-500'
    },
    { 
      name: 'Alerts', 
      href: '/alerts', 
      icon: AlertTriangle,
      color: 'orange',
      gradient: 'from-orange-500 to-yellow-500'
    },
    ...(canViewAnalytics ? [{
      name: 'Analytics', 
      href: '/analytics/ai', 
      icon: BarChart3,
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500'
    }] : []),
  ];

  // Wenn mehr als 4 Items, zeige nur die wichtigsten + "Mehr" Button
  const displayItems = mobileNavItems.slice(0, 4);
  const hasMoreItems = mobileNavItems.length > 4;

  return (
    <>
      {/* Spacer für fixed bottom nav */}
      <div className="h-20 md:hidden" />
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 eco-card border-t border-white/10 backdrop-blur-2xl">
        <div className="px-4 py-3">
          <div className="flex justify-around items-center">
            {displayItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href.startsWith('/buildings') && location.pathname.startsWith('/buildings')) ||
                (item.href.startsWith('/analytics') && location.pathname.startsWith('/analytics'));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 min-w-[4rem]",
                    "hover:transform hover:scale-110 active:scale-95",
                    isActive
                      ? "eco-card-solid bg-gradient-to-br " + item.gradient + "/20 border-" + item.color + "-400/30"
                      : "hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "relative p-2 rounded-xl transition-all duration-300",
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg shadow-${item.color}-500/30`
                      : "bg-slate-700/50"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive ? "text-white" : "text-slate-300"
                    )} />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-all duration-300",
                    isActive ? "text-white" : "text-slate-400"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className={cn(
                      "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full",
                      `bg-${item.color}-400`
                    )} />
                  )}
                </Link>
              );
            })}
            
            {/* "Mehr" Button falls zu viele Items */}
            {hasMoreItems && (
              <Link
                to="/profile"
                className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 min-w-[4rem] hover:bg-white/10"
              >
                <div className="p-2 rounded-xl bg-slate-700/50">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Mehr
                </span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Eco-Indicator Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50" />
      </nav>
    </>
  );
};

export default MobileBottomNav;