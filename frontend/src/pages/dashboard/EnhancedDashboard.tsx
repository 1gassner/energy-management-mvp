import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { notificationService } from '../../services/notification.service';
import { WebSocketMessage, EnergyUpdatePayload, AlertPayload, SystemStatusPayload } from '../../types';
import { DashboardStats } from '../../types/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
// Use existing UI components for now
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { logger } from '../../utils/logger';
import { apiService } from '../../services/serviceFactory';

interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
}

interface DashboardCard {
  title: string;
  description: string;
  link: string;
  icon: string;
  gradient: string;
  badge?: number;
  enabled: boolean;
}

const EnhancedDashboard: React.FC = () => {
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
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Intersection observer hooks for animations
  const { ref: headerRef, isVisible: headerInView } = useIntersectionObserver();
  const { ref: cardsRef, isVisible: cardsInView } = useIntersectionObserver();
  const { ref: statsRef, isVisible: statsInView } = useIntersectionObserver();
  
  // Simple counters for animated numbers
  const energyCount = stats?.totalEnergyProduced || 0;
  const co2Count = stats?.totalCO2Saved || 0;

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
          
          const newActivity: RecentActivity = {
            id: Math.random().toString(36).substr(2, 9),
            message: payload.message || 'New alert received',
            timestamp: new Date().toISOString(),
            type: payload.severity === 'critical' ? 'warning' : 'info'
          };
          
          setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
          
          if (payload.severity === 'critical') {
            notificationService.warning(payload.message || 'Critical alert');
          }
          break;
        }
        
        case 'system_status': {
          const payload = message.payload as SystemStatusPayload;
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

  // Simulate real-time updates
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

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Energy Flow',
      description: 'Real-time energy flow visualization',
      link: '/energy-flow',
      icon: '⚡',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      enabled: true
    },
    {
      title: 'Buildings',
      description: 'Monitor all buildings',
      link: '/buildings/rathaus',
      icon: '🏢',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      enabled: true
    },
    {
      title: 'Alerts',
      description: 'Active alerts and anomalies',
      link: '/alerts',
      icon: '🚨',
      gradient: 'from-red-500 via-pink-500 to-red-600',
      badge: stats && stats.activeAlerts > 0 ? stats.activeAlerts : undefined,
      enabled: true
    },
    {
      title: 'Analytics',
      description: 'AI-powered insights',
      link: '/analytics/ai',
      icon: '📊',
      gradient: 'from-purple-500 via-violet-500 to-purple-600',
      enabled: user?.role === 'admin' || user?.role === 'manager'
    }
  ];

  const getSystemStatusColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-400';
    if (efficiency >= 70) return 'text-yellow-400';
    return 'text-red-400';
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
      <PageTransition mode="fade">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition mode="slide" direction="up">
      <div className="space-y-8">
        {/* Animated Header */}
        <AnimatedCard 
          ref={headerRef}
          animation={headerInView ? "slideInUp" : "none"}
          variant="premium"
          className="overflow-hidden"
        >
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-aurora opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 animate-shimmer">
                  Willkommen zurück, {user?.name || 'User'}! 🚀
                </h1>
                <p className="text-blue-100/90 text-xl mb-6">
                  Ihr intelligentes Energiemanagement-Cockpit
                </p>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse-glow' : 'bg-red-400 animate-pulse'}`} />
                    <span className="text-sm text-blue-200/90 font-medium">
                      {isConnected ? 'Live Connected' : 'Reconnecting...'}
                    </span>
                  </div>
                  
                  {stats && (
                    <div className={`text-sm font-bold px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-500 ${
                      stats.systemEfficiency >= 90 ? 'bg-green-500/20 text-green-300 border-green-400/40 shadow-glow-green' :
                      stats.systemEfficiency >= 70 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40 shadow-glow-yellow' :
                      'bg-red-500/20 text-red-300 border-red-400/40 shadow-glow-red'
                    }`}>
                      System: {getSystemStatusText(stats.systemEfficiency)} ({stats.systemEfficiency.toFixed(1)}%)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <AnimatedCard variant="glass" className="p-6" animation="float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse-glow" />
                    <span className="text-white font-bold text-xl">CityPulse Online</span>
                  </div>
                  <div className="text-blue-200/80 mb-2">
                    🏢 7 Gebäude aktiv überwacht
                  </div>
                  <div className="text-blue-300/80 text-sm">
                    ⚡ Live-Updates: {new Date().toLocaleTimeString('de-DE')}
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Animated Navigation Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.filter(card => card.enabled).map((card, index) => (
            <AnimatedCard
              key={index}
              animation={cardsInView ? "slideInUp" : "none"}
              delay={index * 0.1}
              variant="glass"
              className="group hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <Link to={card.link} className="block h-full">
                <div className="relative p-6 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-4 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl filter drop-shadow-lg">{card.icon}</span>
                      </div>
                      {card.badge && (
                        <div className="bg-red-500/20 text-red-300 text-xs px-3 py-2 rounded-full border border-red-400/30 font-bold animate-pulse-glow shadow-glow-red">
                          {card.badge}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-blue-200/80 group-hover:text-blue-100/90 transition-colors">
                      {card.description}
                    </p>
                    
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <RippleButton variant="ghost" size="sm" className="text-blue-300 hover:text-white">
                        Öffnen →
                      </RippleButton>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          ))}
        </div>

        {/* Stats and Activity Grid */}
        <div ref={statsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Stats Card */}
          <AnimatedCard 
            animation={statsInView ? "slideInLeft" : "none"}
            variant="premium"
            className="overflow-hidden"
          >
            <div className="relative p-6">
              <div className="absolute inset-0 bg-gradient-energy opacity-20" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse-glow" />
                  <h2 className="text-2xl font-bold text-white">
                    Live-Statistiken
                  </h2>
                </div>
                
                {stats ? (
                  <div className="space-y-4">
                    <AnimatedCard variant="glass" className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">⚡ Energie Produziert</span>
                        <span className="font-bold text-2xl text-green-400 animate-counter">
                          {Math.round(energyCount).toLocaleString()} kWh
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-glow transition-all duration-1000"
                          style={{ width: `${Math.min((energyCount / 10000) * 100, 100)}%` }}
                        />
                      </div>
                    </AnimatedCard>
                    
                    <AnimatedCard variant="glass" className="p-4" delay={0.1}>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">🔥 Energie Verbraucht</span>
                        <span className="font-bold text-2xl text-yellow-400">
                          {stats.totalEnergyConsumed.toLocaleString()} kWh
                        </span>
                      </div>
                    </AnimatedCard>
                    
                    <AnimatedCard variant="glass" className="p-4" delay={0.2}>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">🌱 CO₂ Eingespart</span>
                        <span className="font-bold text-2xl text-green-400 animate-counter">
                          {Math.round(co2Count).toLocaleString()} kg
                        </span>
                      </div>
                    </AnimatedCard>
                    
                    <AnimatedCard variant="glass" className="p-4" delay={0.3}>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">🚨 Aktive Alerts</span>
                        <span className={`font-bold text-2xl ${stats.activeAlerts > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                          {stats.activeAlerts}
                        </span>
                      </div>
                    </AnimatedCard>
                    
                    <AnimatedCard variant="glass" className="p-4" delay={0.4}>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">⚙️ System Effizienz</span>
                        <span className={`font-bold text-2xl ${getSystemStatusColor(stats.systemEfficiency)}`}>
                          {stats.systemEfficiency.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            stats.systemEfficiency >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            stats.systemEfficiency >= 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                            'bg-gradient-to-r from-red-400 to-rose-500'
                          }`}
                          style={{ width: `${stats.systemEfficiency}%` }}
                        />
                      </div>
                    </AnimatedCard>
                  </div>
                ) : (
                  <div className="text-center text-blue-200/60">
                    <LoadingSpinner size="sm" text="Lade Statistiken..." />
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>

          {/* Enhanced Activity Feed */}
          <AnimatedCard 
            animation={statsInView ? "slideInRight" : "none"}
            variant="glass"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse-glow" />
                <h2 className="text-2xl font-bold text-white">
                  Live-Aktivitäten
                </h2>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {recentActivity.map((activity, index) => (
                  <AnimatedCard 
                    key={activity.id}
                    variant="glass" 
                    className="p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                    animation="slideInLeft"
                    delay={index * 0.05}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-1 animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white break-words font-medium leading-relaxed">
                          {activity.message}
                        </p>
                        <p className="text-xs text-blue-300/60 mt-2 flex items-center gap-2">
                          🕒 {new Date(activity.timestamp).toLocaleTimeString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default EnhancedDashboard;