import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { notificationService } from '../../services/notification.service';
import { WebSocketMessage, EnergyUpdatePayload, AlertPayload, SystemStatusPayload } from '../../types';
import { DashboardStats } from '../../types/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { logger } from '../../utils/logger';
import { apiService } from '../../services/serviceFactory';


interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      message: 'Stadt Hechingen CityPulse - Alle 7 Gebäude online',
      timestamp: new Date().toISOString(),
      type: 'success'
    },
    {
      id: '2',
      message: 'Hallenbad: Höchster Verbrauch (35% Gesamtverbrauch)',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'warning'
    },
    {
      id: '3',
      message: 'Realschule KfW-55: Beste Effizienz erreicht',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'success'
    },
    {
      id: '4',
      message: 'European Energy Award Status aktiv',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'info'
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket connection for real-time updates
  const { isConnected, connectionState } = useWebSocket('dashboard_update', {
    onMessage: (message: WebSocketMessage) => {
      logger.debug('Dashboard received WebSocket message', { type: message.type, payload: message.payload });
      
      switch (message.type) {
        case 'energy_update': {
          const payload = message.payload as EnergyUpdatePayload;
          setStats(prev => prev ? ({
            ...prev,
            totalEnergyProduced: payload.totalEnergy || prev.totalEnergyProduced,
            totalCO2Saved: payload.co2Saved || prev.totalCO2Saved
          }) : null);
          break;
        }
        
        case 'alert': {
          const payload = message.payload as AlertPayload;
          setStats(prev => prev ? ({
            ...prev,
            activeAlerts: payload.alertCount || prev.activeAlerts
          }) : null);
          
          // Add to recent activity
          const newActivity: RecentActivity = {
            id: Math.random().toString(36).substr(2, 9),
            message: payload.message || 'New alert received',
            timestamp: new Date().toISOString(),
            type: payload.severity === 'critical' ? 'warning' : 'info'
          };
          
          setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
          
          // Show notification for critical alerts
          if (payload.severity === 'critical') {
            notificationService.warning(payload.message || 'Critical alert');
          }
          break;
        }
        
        case 'system_status': {
          const payload = message.payload as SystemStatusPayload;
          // Handle system status updates
          const newActivity: RecentActivity = {
            id: Math.random().toString(36).substr(2, 9),
            message: `System status: ${payload.status || 'unknown'}`,
            timestamp: new Date().toISOString(),
            type: payload.status === 'online' ? 'success' : 'warning'
          };
          
          setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
          break;
        }
        
        default:
          logger.warn('Unknown WebSocket message type', { type: message.type });
      }
    },
    onConnect: () => {
      logger.info('Dashboard WebSocket connected');
      notificationService.success('Real-time updates connected');
    },
    onDisconnect: () => {
      logger.info('Dashboard WebSocket disconnected');
      notificationService.warning('Real-time updates disconnected');
    },
    autoConnect: true
  });

  // Load initial dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const dashboardStats = await apiService.getDashboardStats();
        setStats(dashboardStats);
        
        // Add initial activity entry
        const initialActivity: RecentActivity = {
          id: 'initial',
          message: 'Dashboard loaded successfully',
          timestamp: new Date().toISOString(),
          type: 'success'
        };
        setRecentActivity(prev => [initialActivity, ...prev]);
        
        setIsLoading(false);
      } catch (error) {
        logger.error('Failed to load dashboard data', error as Error);
        notificationService.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Simulate real-time updates when not connected to WebSocket
  useEffect(() => {
    if (!isConnected && stats) {
      const interval = setInterval(() => {
        setStats(prev => prev ? ({
          ...prev,
          totalEnergyProduced: prev.totalEnergyProduced + (Math.random() - 0.5) * 10,
          totalCO2Saved: prev.totalCO2Saved + (Math.random() - 0.5) * 2
        }) : null);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isConnected, stats]);

  const dashboardCards = [
    {
      title: 'Energy Flow',
      description: 'Real-time energy flow visualization',
      link: '/energy-flow',
      icon: '⚡',
      color: 'bg-blue-500',
      enabled: true
    },
    {
      title: 'Buildings',
      description: 'Monitor all buildings',
      link: '/buildings/rathaus',
      icon: '🏢',
      color: 'bg-green-500',
      enabled: true
    },
    {
      title: 'Alerts',
      description: 'Active alerts and anomalies',
      link: '/alerts',
      icon: '🚨',
      color: 'bg-red-500',
      badge: stats && stats.activeAlerts > 0 ? stats.activeAlerts : undefined,
      enabled: true
    },
    {
      title: 'Analytics',
      description: 'AI-powered insights',
      link: '/analytics/ai',
      icon: '📊',
      color: 'bg-purple-500',
      enabled: user?.role === 'admin' || user?.role === 'manager'
    }
  ];

  const getSystemStatusColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSystemStatusText = (efficiency: number) => {
    if (efficiency >= 90) return 'Excellent';
    if (efficiency >= 70) return 'Good';
    return 'Needs Attention';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Dashboard Header Card */}
      <div className="glass-card-hechingen-primary p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              Willkommen zurück, {user?.name || 'User'}!
            </h1>
            <p className="text-blue-100/80 text-lg">
              Überwachen und verwalten Sie Ihre Energiesysteme
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-blue-200/80 font-medium">
                  {isConnected ? 'Verbunden' : 'Getrennt'}
                </span>
              </div>
              {stats && (
                <div className={`text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                  stats.systemEfficiency >= 90 ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                  stats.systemEfficiency >= 70 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                  'bg-red-500/20 text-red-300 border border-red-400/30'
                }`}>
                  System: {getSystemStatusText(stats.systemEfficiency)}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="glass-card-light p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-bold text-lg">CityPulse Online</span>
              </div>
              <div className="text-blue-200/80 text-sm mb-2">
                Letztes Update: {new Date().toLocaleTimeString('de-DE')}
              </div>
              <div className="text-blue-300/80 text-xs">
                Alle 7 Gebäude überwacht
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dashboard Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.filter(card => card.enabled).map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="block glass-card-medium group hover:scale-105 transition-all duration-300 relative"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-blue-400/30">
                  <span className="text-2xl">{card.icon}</span>
                </div>
                {card.badge && (
                  <div className="bg-red-500/20 text-red-300 text-xs px-3 py-1 rounded-full border border-red-400/30 font-bold">
                    {card.badge}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {card.title}
              </h3>
              <p className="text-blue-200/80 text-sm">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-medium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">
              Schnell-Statistiken
            </h2>
          </div>
          {stats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-blue-200/80">Energie Produziert</span>
                <span className="font-bold text-white">{stats.totalEnergyProduced.toFixed(0)} kWh</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-blue-200/80">Energie Verbraucht</span>
                <span className="font-bold text-white">{stats.totalEnergyConsumed.toFixed(0)} kWh</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-blue-200/80">CO₂ Eingespart</span>
                <span className="font-bold text-green-400">{stats.totalCO2Saved.toFixed(0)} kg</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-blue-200/80">Aktive Alerts</span>
                <span className={`font-bold ${stats.activeAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.activeAlerts}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-blue-200/80">System Effizienz</span>
                <span className={`font-bold ${
                  stats.systemEfficiency >= 90 ? 'text-green-400' :
                  stats.systemEfficiency >= 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {stats.systemEfficiency.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-blue-200/80">Verbindungsstatus</span>
                <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {connectionState}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-blue-200/60">
              <LoadingSpinner size="sm" text="Lade Statistiken..." />
            </div>
          )}
        </div>

        <div className="glass-card-medium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">
              Letzte Aktivitäten
            </h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <span className="text-lg mt-0.5">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white break-words font-medium">{activity.message}</p>
                  <p className="text-xs text-blue-300/60 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;