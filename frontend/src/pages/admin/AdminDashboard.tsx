import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import { notificationService } from '../../services/notification.service';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Building2, 
  Settings, 
  Database, 
  Shield,
  Activity,
  TrendingUp,
  ChevronRight,
  Building as BuildingIcon,
  BarChart3,
  Brain,
  Eye,
  Target
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [kpis, setKpis] = useState({
    totalSavings: 45600,
    co2Reduction: 187.3,
    systemAvailability: 99.2,
    activeAlarms: 3,
    iso50001Compliance: 94,
    totalUsers: 47,
    activeUsers: 42,
    totalBuildings: 7,
    sensors: 745
  });

  const [systemData] = useState([
    { building: 'Rathaus', status: 'Online', efficiency: 92, alerts: 1 },
    { building: 'Realschule', status: 'Online', efficiency: 88, alerts: 0 },
    { building: 'Grundschule', status: 'Online', efficiency: 95, alerts: 0 },
    { building: 'Werkrealschule', status: 'Online', efficiency: 91, alerts: 0 },
    { building: 'Gymnasium', status: 'Online', efficiency: 89, alerts: 1 },
    { building: 'Sporthallen', status: 'Maintenance', efficiency: 85, alerts: 2 },
    { building: 'Hallenbad', status: 'Online', efficiency: 90, alerts: 0 }
  ]);

  const energyTrends = [
    { month: 'Jan', consumption: 145000, savings: 8500, co2: 32 },
    { month: 'Feb', consumption: 132000, savings: 9200, co2: 38 },
    { month: 'Mar', consumption: 128000, savings: 9800, co2: 42 },
    { month: 'Apr', consumption: 118000, savings: 10500, co2: 45 },
    { month: 'Mai', consumption: 112000, savings: 11200, co2: 48 },
    { month: 'Jun', consumption: 108000, savings: 11800, co2: 52 }
  ];

  const complianceData = [
    { category: 'Energiemonitoring', score: 98 },
    { category: 'Dokumentation', score: 92 },
    { category: 'Zielerfüllung', score: 89 },
    { category: 'Schulungen', score: 95 },
    { category: 'Audits', score: 97 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 50),
        co2Reduction: prev.co2Reduction + (Math.random() - 0.5) * 1,
        systemAvailability: Math.max(98, Math.min(100, prev.systemAvailability + (Math.random() - 0.5) * 0.5))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'export':
        notificationService.success('Datenexport wird vorbereitet...');
        break;
      case 'maintenance':
        notificationService.info('Wartungsplan wird geöffnet...');
        break;
      case 'alerts':
        notificationService.warning('3 aktive Alarme gefunden');
        break;
      case 'report':
        notificationService.loading('Bericht wird generiert...');
        break;
      default:
        notificationService.info('Aktion ausgeführt');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Eco Header */}
        <EcoCard variant="glass" className="mb-8 p-8" glow="purple">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3 flex items-center gap-4">
                <Shield className="w-12 h-12 text-purple-400" />
                Admin Dashboard
              </h1>
              <p className="text-purple-200/80 text-lg">
                Zentrale Verwaltung und Überwachung aller Energiesysteme
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-400/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 font-medium">System Online</span>
              </div>
            </div>
          </div>
        </EcoCard>

        {/* Admin KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoKPICard
            title="Gesamteinsparung"
            value={`€${kpis.totalSavings.toLocaleString()}`}
            icon={TrendingUp}
            trend={{
              value: 8.3,
              isPositive: true,
              label: "vs. Vorjahr"
            }}
            color="purple"
            progress={85}
          />
          
          <EcoKPICard
            title="Systemverfügbarkeit"
            value={kpis.systemAvailability.toFixed(1)}
            unit="%"
            icon={Activity}
            trend={{
              value: 2.1,
              isPositive: true,
              label: "letzte 30 Tage"
            }}
            color="blue"
            progress={kpis.systemAvailability}
          />
          
          <EcoKPICard
            title="Aktive Benutzer"
            value={kpis.activeUsers}
            subtitle={`von ${kpis.totalUsers} Gesamtbenutzer`}
            icon={Users}
            trend={{
              value: 5.2,
              isPositive: true,
              label: "neue Benutzer"
            }}
            color="purple"
            progress={(kpis.activeUsers / kpis.totalUsers) * 100}
          />
          
          <EcoKPICard
            title="Gebäude verwaltet"
            value={kpis.totalBuildings}
            unit="Standorte"
            icon={Building2}
            trend={{
              value: 100,
              isPositive: true,
              label: "vollständig erfasst"
            }}
            color="blue"
            progress={100}
          />
        </div>

        {/* Admin Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoCard 
            variant="glass" 
            className="text-center group cursor-pointer" 
            hover={true}
            glow="purple"
            onClick={() => navigate('/admin/users')}
          >
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Benutzerverwaltung
              </h3>
              <p className="text-purple-200/80 text-sm mb-6">
                Benutzer, Rollen und Berechtigungen verwalten
              </p>
              <div className="flex items-center justify-center text-purple-300 font-medium group-hover:text-white transition-colors duration-300">
                Verwalten <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </EcoCard>

          <EcoCard 
            variant="glass" 
            className="text-center group cursor-pointer" 
            hover={true}
            glow="blue"
            onClick={() => navigate('/admin/buildings')}
          >
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Gebäudeverwaltung
              </h3>
              <p className="text-blue-200/80 text-sm mb-6">
                Gebäude und deren Systeme konfigurieren
              </p>
              <div className="flex items-center justify-center text-blue-300 font-medium group-hover:text-white transition-colors duration-300">
                Konfigurieren <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </EcoCard>

          <EcoCard 
            variant="glass" 
            className="text-center group cursor-pointer" 
            hover={true}
            glow="purple"
            onClick={() => navigate('/admin/sensors')}
          >
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Sensor Management
              </h3>
              <p className="text-purple-200/80 text-sm mb-6">
                {kpis.sensors} Sensoren überwachen und konfigurieren
              </p>
              <div className="flex items-center justify-center text-purple-300 font-medium group-hover:text-white transition-colors duration-300">
                Überwachen <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </EcoCard>

          <EcoCard 
            variant="glass" 
            className="text-center group cursor-pointer" 
            hover={true}
            glow="blue"
            onClick={() => handleQuickAction('settings')}
          >
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Systemeinstellungen
              </h3>
              <p className="text-blue-200/80 text-sm mb-6">
                Globale Konfiguration und Parameter
              </p>
              <div className="flex items-center justify-center text-blue-300 font-medium group-hover:text-white transition-colors duration-300">
                Einstellungen <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </EcoCard>
        </div>

        {/* Admin Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EcoCard variant="glass" className="p-6" glow="blue">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Energietrends</h3>
                <p className="text-blue-200/80 text-sm">Monatliche Entwicklung der Energieverbräuche</p>
              </div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
              <LazyLineChart data={energyTrends.map(item => ({ 
                time: item.month, 
                consumption: item.consumption / 1000, 
                production: item.savings / 100, 
                grid: item.co2 
              }))} height={300} />
            </div>
          </EcoCard>

          <EcoCard variant="glass" className="p-6" glow="purple">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">ISO 50001 Konformität</h3>
                <p className="text-purple-200/80 text-sm">Bewertung nach Kategorien</p>
              </div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
              <LazyBarChart 
                data={complianceData.map(item => ({ name: item.category, value: item.score }))} 
                height={300} 
                color="#8B5CF6" 
              />
            </div>
          </EcoCard>
        </div>

        {/* System Status Table */}
        <EcoCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BuildingIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Systemstatus Übersicht</h2>
          </div>
          
          <div className="overflow-x-auto bg-black/20 rounded-2xl backdrop-blur-sm">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Gebäude
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Effizienz
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Alarme
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {systemData.map((system, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{system.building}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        system.status === 'Online' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                        system.status === 'Maintenance' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                        'bg-red-500/20 text-red-300 border border-red-400/30'
                      )}>
                        {system.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white font-medium">{system.efficiency}%</span>
                        <div className="w-20 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${system.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-sm font-medium",
                        system.alerts > 0 ? 'text-red-400' : 'text-green-400'
                      )}>
                        {system.alerts || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium">
                          Details
                        </button>
                        <button className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-medium">
                          Verwalten
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EcoCard>
      </div>
    </div>
  );
};

export default AdminDashboard; 