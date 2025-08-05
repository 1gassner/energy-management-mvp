import React, { useState } from 'react';
import { clsx } from 'clsx';
import { GlassHeading, GlassText } from '@/components/ui/GlassTypography';
import { GlassButton } from '@/components/ui/GlassButton';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Share2,
  ChevronLeft,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

export interface BuildingDetailTemplateProps {
  children: React.ReactNode;
  
  // Building Information
  buildingName: string;
  buildingType: string;
  address: string;
  yearBuilt?: number;
  totalArea?: number;
  floors?: number;
  occupancy?: number;
  
  // Status Information
  status: 'online' | 'offline' | 'maintenance' | 'warning' | 'error';
  lastUpdated?: Date;
  
  // Key Metrics (displayed in header)
  keyMetrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
    trend?: number;
    status?: 'good' | 'warning' | 'critical';
    icon?: React.ReactNode;
  }>;
  
  // Tab Navigation
  tabs?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content?: React.ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // Actions
  onBack?: () => void;
  onBookmark?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  
  // State
  isBookmarked?: boolean;
  
  // Customization
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const BuildingDetailTemplate: React.FC<BuildingDetailTemplateProps> = ({
  children,
  buildingName,
  buildingType,
  address,
  yearBuilt,
  totalArea,
  floors,
  occupancy,
  status,
  lastUpdated,
  keyMetrics = [],
  tabs = [],
  activeTab,
  onTabChange,
  onBack,
  onBookmark,
  onDownload,
  onShare,
  onSettings,
  isBookmarked = false,
  className,
  headerClassName,
  contentClassName
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20';
      case 'offline': return 'text-gray-400 bg-gray-500/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20';
      case 'warning': return 'text-orange-400 bg-orange-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'glass-text-primary';
    }
  };

  return (
    <div className={clsx('min-h-screen glass-backdrop-hechingen', className)}>
      <div className="glass-container py-6">
        {/* Header Section */}
        <div className={clsx(
          'glass-card-hechingen-primary p-6 mb-6',
          headerClassName
        )}>
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={onBack}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Zurück
                </GlassButton>
              )}
              
              {/* Status Badge */}
              <div className={clsx(
                'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                getStatusColor(status)
              )}>
                {getStatusIcon(status)}
                <span className="capitalize">{status}</span>
              </div>

              {lastUpdated && (
                <div className="flex items-center gap-2 glass-text-muted text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Aktualisiert: {lastUpdated.toLocaleString('de-DE')}</span>
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {onBookmark && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={onBookmark}
                  leftIcon={isBookmarked ? 
                    <BookmarkCheck className="w-4 h-4" /> : 
                    <Bookmark className="w-4 h-4" />
                  }
                >
                  {isBookmarked ? 'Gemerkt' : 'Merken'}
                </GlassButton>
              )}
              
              {onShare && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={onShare}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Teilen
                </GlassButton>
              )}
              
              {onDownload && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={onDownload}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Export
                </GlassButton>
              )}
              
              {onSettings && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={onSettings}
                  leftIcon={<Settings className="w-4 h-4" />}
                >
                  Einstellungen
                </GlassButton>
              )}
            </div>
          </div>

          {/* Building Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="glass-card-light p-4 rounded-xl">
                  <Building2 className="w-8 h-8 text-hechingen-blue-400" />
                </div>
                <div className="flex-1">
                  <GlassHeading level={1} size="3xl" className="mb-2">
                    {buildingName}
                  </GlassHeading>
                  <GlassText size="lg" variant="accent" className="mb-3 font-medium">
                    {buildingType}
                  </GlassText>
                  
                  <div className="flex flex-wrap items-center gap-4 glass-text-secondary">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{address}</span>
                    </div>
                    {yearBuilt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Baujahr {yearBuilt}</span>
                      </div>
                    )}
                    {totalArea && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{totalArea.toLocaleString()} m²</span>
                      </div>
                    )}
                    {floors && (
                      <div className="flex items-center gap-2">
                        <span>{floors} Etagen</span>
                      </div>
                    )}
                    {occupancy && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{occupancy} Personen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            {keyMetrics.length > 0 && (
              <div className="glass-card-light p-4 rounded-xl">
                <GlassHeading level={3} size="lg" className="mb-4">
                  Aktuelle Werte
                </GlassHeading>
                <div className="space-y-3">
                  {keyMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {metric.icon && (
                          <div className="text-hechingen-blue-400">
                            {metric.icon}
                          </div>
                        )}
                        <span className="glass-text-secondary text-sm">
                          {metric.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={clsx(
                          'font-semibold',
                          metric.status ? getMetricStatusColor(metric.status) : 'glass-text-primary'
                        )}>
                          {metric.value}{metric.unit && ` ${metric.unit}`}
                        </div>
                        {metric.trend !== undefined && (
                          <div className={clsx(
                            'text-xs flex items-center gap-1',
                            metric.trend > 0 ? 'text-green-400' : 
                            metric.trend < 0 ? 'text-red-400' : 'glass-text-muted'
                          )}>
                            <TrendingUp className={clsx(
                              'w-3 h-3',
                              metric.trend < 0 && 'rotate-180'
                            )} />
                            {Math.abs(metric.trend)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {tabs.length > 0 && (
          <div className="glass-card-medium p-6 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    'font-medium border',
                    currentTab === tab.id ? [
                      'glass-button-hechingen-primary border-hechingen-blue-500/30',
                      'text-white'
                    ] : [
                      'glass-button-secondary border-transparent',
                      'hover:border-hechingen-blue-500/20'
                    ]
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <div className="glass-badge-success">
                      {tab.badge}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className={clsx('space-y-6', contentClassName)}>
          {tabs.length > 0 ? (
            <>
              {tabs.find(tab => tab.id === currentTab)?.content || children}
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized Building Templates
export const SchoolBuildingTemplate: React.FC<Omit<BuildingDetailTemplateProps, 'buildingType'>> = (props) => (
  <BuildingDetailTemplate {...props} buildingType="Schulgebäude" />
);

export const PublicBuildingTemplate: React.FC<Omit<BuildingDetailTemplateProps, 'buildingType'>> = (props) => (
  <BuildingDetailTemplate {...props} buildingType="Öffentliches Gebäude" />
);

export const SportsComplexTemplate: React.FC<Omit<BuildingDetailTemplateProps, 'buildingType'>> = (props) => (
  <BuildingDetailTemplate {...props} buildingType="Sportkomplex" />
);