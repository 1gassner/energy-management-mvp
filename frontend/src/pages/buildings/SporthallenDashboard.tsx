import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Trophy, 
  Users, 
  Zap, 
  Euro, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  Target,
  Calendar
} from 'lucide-react';

const SporthallenDashboard: React.FC = () => {
  const [, setBuilding] = useState<Building | null>(null);
  const [, setSensors] = useState<Sensor[]>([]);
  const [, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  // Sports facility KPIs
  const sportsKpis = {
    energyIntensity: 78.4,
    activitiesPerWeek: 156,
    energyCosts: 1180.75,
    utilizationRate: 87.5
  };

  const energyDataMock = [
    { time: '00:00', consumption: 15, production: 0, grid: 15, temperature: 16 },
    { time: '06:00', consumption: 25, production: 0, grid: 25, temperature: 17 },
    { time: '12:00', consumption: 45, production: 0, grid: 45, temperature: 20 },
    { time: '18:00', consumption: 85, production: 0, grid: 85, temperature: 24 },
    { time: '24:00', consumption: 35, production: 0, grid: 35, temperature: 18 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const buildingData = await apiService.getBuilding('sporthallen-hechingen');
        setBuilding(buildingData);
        
        const sensorsData = await apiService.getSensors('sporthallen-hechingen');
        setSensors(sensorsData);
        
        const energyDataResponse = await apiService.getEnergyData('sporthallen-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Sporthallen-Daten');
        console.error('Error fetching sporthallen data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Sporthallen-Daten..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fehler beim Laden
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Simple placeholder content until full conversion

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Eco Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-red-500/5" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Sports Header */}
        <EcoCard variant="glass" size="lg" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-red-300 bg-clip-text text-transparent mb-2">
                    Sporthallen Hechingen
                  </h1>
                  <p className="text-slate-300 text-xl font-medium">
                    Sportkomplex • Baujahr: 1985 • Fläche: 4,200 m² • 3 Hallen
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-yellow-500/20 border border-yellow-400/30 rounded-2xl backdrop-blur-sm hover:bg-yellow-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-yellow-300" />
                    <span className="text-yellow-200 font-semibold">RENOVIERUNG SEIT 2010 ÜBERFÄLLIG</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl backdrop-blur-sm hover:bg-blue-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-200 font-semibold">HOCHFREQUENTIERT</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <EcoCard variant="glass" size="sm">
                <div className="text-sm text-slate-400">Energieklasse</div>
                <div className="text-3xl font-bold text-orange-400">D</div>
                <div className="text-sm text-slate-400 mt-1">
                  Modernisierung erforderlich
                </div>
              </EcoCard>
            </div>
          </div>
        </EcoCard>

        {/* Sports Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoKPICard
            title="Energieintensität"
            value={sportsKpis.energyIntensity.toFixed(1)}
            unit="kWh/m²"
            icon={Zap}
            color="orange"
            trend={{
              value: -15.3,
              label: "Verbesserung nötig",
              isPositive: false
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Sportaktivitäten"
            value={sportsKpis.activitiesPerWeek.toString()}
            unit="/Woche"
            icon={Activity}
            color="green"
            trend={{
              value: 8.7,
              label: "Zunahme",
              isPositive: true
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Energiekosten"
            value={`€${sportsKpis.energyCosts.toFixed(0)}`}
            unit="/Monat"
            icon={Euro}
            color="purple"
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Auslastung"
            value={sportsKpis.utilizationRate.toFixed(1)}
            unit="%"
            icon={Trophy}
            color="blue"
            progress={sportsKpis.utilizationRate}
            trend={{
              value: 8.7,
              label: "Sehr gut",
              isPositive: true
            }}
            className="touch-friendly"
          />
        </div>

        <EcoCard variant="glass" size="lg" className="mb-8 touch-friendly">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Sporthallen - Renovierung seit 2010 überfällig
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Hochfrequentierte Sportstätten benötigen dringend LED-Beleuchtung und effiziente Lüftungstechnik.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-4 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400 font-bold text-lg">1985</div>
                  <div className="text-orange-300 text-sm">Baujahr</div>
                </div>
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 rounded-xl border border-red-500/30">
                  <div className="text-red-400 font-bold text-lg">15 Jahre</div>
                  <div className="text-red-300 text-sm">Renovierungsrückstand</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-4 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold text-lg">156</div>
                  <div className="text-yellow-300 text-sm">Aktivitäten/Woche</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="text-green-400 font-bold text-lg">55%</div>
                  <div className="text-green-300 text-sm">Einsparpotential</div>
                </div>
              </div>
            </div>
          </div>
        </EcoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Sportbetrieb Energieverbrauch</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Peak-Nutzung 17:00-22:00 Uhr
            </div>
            <LazyLineChart data={energyDataMock} height={300} />
          </EcoCard>

          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Modernisierungsbedarf</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/30">
                <h4 className="font-medium text-red-300 mb-2">
                  Dringende Maßnahmen
                </h4>
                <div className="text-sm text-red-400">
                  • LED-Hallenbeleuchtung (30% Einsparung)<br/>
                  • Effiziente Lüftungsanlage (15% Einsparung)<br/>
                  • Smart Heating Control
                </div>
              </div>
            </div>
          </EcoCard>
        </div>
      </div>
    </div>
  );
};

export default SporthallenDashboard;