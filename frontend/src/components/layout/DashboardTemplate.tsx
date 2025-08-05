import React, { useState } from 'react';
import { clsx } from 'clsx';
import { GlassHeading } from '@/components/ui/GlassTypography';
import { GlassNavigation, NavigationItem } from '@/components/ui/GlassNavigation';
import { 
  Maximize2, 
  Minimize2, 
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

export interface DashboardTemplateProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  
  // Layout options
  layout?: 'default' | 'grid' | 'full-width' | 'sidebar-right';
  gridCols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Header options
  showSearch?: boolean;
  showFilters?: boolean;
  showRefresh?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  
  // Navigation
  breadcrumbs?: NavigationItem[];
  quickActions?: NavigationItem[];
  
  // Sidebar (for sidebar-right layout)
  sidebarContent?: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  
  // Customization
  headerClassName?: string;
  contentClassName?: string;
  className?: string;
  
  // Event handlers
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  title,
  subtitle,
  icon,
  layout = 'default',
  gridCols = 3,
  gap = 'lg',
  showSearch = true,
  showFilters = false,
  showRefresh = true,
  showSettings = true,
  showNotifications = true,
  breadcrumbs = [],
  quickActions = [],
  sidebarContent,
  sidebarWidth = 'md',
  headerClassName,
  contentClassName,
  className,
  onSearch,
  onRefresh,
  onSettingsClick,
  onNotificationClick
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const containerClasses = clsx(
    'w-full',
    'glass-backdrop-hechingen transition-all duration-500',
    isFullscreen && 'fixed inset-0 z-50',
    className
  );

  const headerClasses = clsx(
    'glass-card-hechingen-primary p-6 mb-6',
    'border-b border-hechingen-blue-500/20',
    headerClassName
  );

  const contentClasses = clsx(
    // Base content styles
    'space-y-6',
    
    // Layout variations
    layout === 'grid' && 'glass-grid',
    layout === 'grid' && gridCols === 1 && 'glass-grid-cols-1',
    layout === 'grid' && gridCols === 2 && 'glass-grid-cols-2', 
    layout === 'grid' && gridCols === 3 && 'glass-grid-cols-3',
    layout === 'grid' && gridCols === 4 && 'glass-grid-cols-4',
    layout === 'full-width' && 'w-full',
    
    // Gap variations
    gap === 'sm' && 'gap-4',
    gap === 'md' && 'gap-6',
    gap === 'lg' && 'gap-8',
    gap === 'xl' && 'gap-12',
    
    contentClassName
  );

  const sidebarClasses = clsx(
    'glass-card-medium p-6',
    sidebarWidth === 'sm' && 'w-80',
    sidebarWidth === 'md' && 'w-96',
    sidebarWidth === 'lg' && 'w-[28rem]'
  );

  return (
    <div className={containerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className={headerClasses}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="mb-4">
              <GlassNavigation
                items={breadcrumbs}
                orientation="horizontal"
                variant="minimal"
                size="sm"
              />
            </div>
          )}

          {/* Main Header */}
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              {icon && (
                <div className="glass-card-light p-3 rounded-xl">
                  {icon}
                </div>
              )}
              <div>
                <GlassHeading level={1} size="3xl" className="mb-1">
                  {title}
                </GlassHeading>
                {subtitle && (
                  <p className="glass-text-secondary text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {/* Search */}
              {showSearch && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 glass-text-muted" />
                  <input
                    type="text"
                    placeholder="Suchen..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="glass-input pl-10 pr-4 py-2 w-64"
                  />
                </div>
              )}
              
              {/* Mobile Search Button */}
              {showSearch && (
                <button className="glass-button-secondary p-3 md:hidden touch-target" aria-label="Suchen">
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Filters */}
              {showFilters && (
                <button className="glass-button-secondary p-3 touch-target" aria-label="Filter">
                  <Filter className="w-5 h-5" />
                </button>
              )}

              {/* Refresh */}
              {showRefresh && (
                <button 
                  onClick={handleRefresh}
                  className="glass-button-secondary p-3 touch-target"
                  disabled={refreshing}
                  aria-label="Aktualisieren"
                >
                  <RefreshCw className={clsx('w-5 h-5', refreshing && 'animate-spin')} />
                </button>
              )}

              {/* Notifications */}
              {showNotifications && (
                <button 
                  onClick={onNotificationClick}
                  className="glass-button-secondary p-3 relative touch-target"
                  aria-label="Benachrichtigungen"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
              )}

              {/* Settings */}
              {showSettings && (
                <button 
                  onClick={onSettingsClick}
                  className="glass-button-secondary p-3 touch-target hidden sm:flex"
                  aria-label="Einstellungen"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}

              {/* Fullscreen Toggle */}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="glass-button-secondary p-3 touch-target hidden lg:flex"
                aria-label={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              {/* More Actions */}
              <button className="glass-button-secondary p-3 touch-target" aria-label="Weitere Aktionen">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="mt-6">
              <GlassNavigation
                items={quickActions}
                orientation="horizontal"
                variant="hechingen"
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={clsx(
          layout === 'sidebar-right' && 'flex flex-col lg:flex-row gap-4 lg:gap-8'
        )}>
          {/* Primary Content */}
          <div className={clsx(
            layout === 'sidebar-right' && 'flex-1 min-w-0',
            contentClasses
          )}>
            <div className="overflow-x-auto">
              {children}
            </div>
          </div>

          {/* Sidebar (if using sidebar-right layout) */}
          {layout === 'sidebar-right' && sidebarContent && (
            <aside className={sidebarClasses}>
              {sidebarContent}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized Dashboard Templates
export const DashboardTemplateGrid: React.FC<Omit<DashboardTemplateProps, 'layout'>> = (props) => (
  <DashboardTemplate {...props} layout="grid" />
);

export const DashboardTemplateFullWidth: React.FC<Omit<DashboardTemplateProps, 'layout'>> = (props) => (
  <DashboardTemplate {...props} layout="full-width" />
);

export const DashboardTemplateSidebar: React.FC<Omit<DashboardTemplateProps, 'layout'>> = (props) => (
  <DashboardTemplate {...props} layout="sidebar-right" />
);

// Pre-configured Templates for Hechingen
export const HechingenDashboardTemplate: React.FC<DashboardTemplateProps> = (props) => (
  <DashboardTemplate
    {...props}
    showSearch={true}
    showRefresh={true}
    showSettings={true}
    showNotifications={true}
    layout="grid"
    gridCols={3}
    gap="lg"
  />
);