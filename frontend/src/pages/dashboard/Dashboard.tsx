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
      message: 'System online - All buildings connected',
      timestamp: new Date().toISOString(),
      type: 'success'
    },
    {
      id: '2',
      message: 'High consumption detected at Rathaus',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'warning'
    },
    {
      id: '3',
      message: 'Weekly report generated',
      timestamp: new Date(Date.now() - 600000).toISOString(),
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage your energy systems
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {stats && (
                <div className={`text-sm font-medium ${getSystemStatusColor(stats.systemEfficiency)}`}>
                  System: {getSystemStatusText(stats.systemEfficiency)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.filter(card => card.enabled).map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 relative"
            >
              <div className={`inline-flex p-3 rounded-lg ${card.color} text-white mb-4`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              {card.badge && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {card.badge}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Stats
            </h2>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Energy Produced</span>
                  <span className="font-semibold">{stats.totalEnergyProduced.toFixed(0)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Energy Consumed</span>
                  <span className="font-semibold">{stats.totalEnergyConsumed.toFixed(0)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CO₂ Saved</span>
                  <span className="font-semibold text-green-600">{stats.totalCO2Saved.toFixed(0)} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Alerts</span>
                  <span className={`font-semibold ${stats.activeAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.activeAlerts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">System Efficiency</span>
                  <span className={`font-semibold ${getSystemStatusColor(stats.systemEfficiency)}`}>
                    {stats.systemEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Connection Status</span>
                  <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {connectionState}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <LoadingSpinner size="sm" text="Loading stats..." />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <span className="text-lg mt-0.5">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 break-words">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;