import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import { 
  School, 
  Award, 
  Users, 
  Zap,
  AlertTriangle,
  Star,
  Euro,
  TrendingUp,
  Trophy,
  Target,
  BookOpen,
  Clock,
  CheckCircle,
  Leaf
} from 'lucide-react';

const RealschuleDashboard: React.FC = () => {
  const [building, setBuilding] = useState<Building | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  const [, setKpis] = useState({
    energyIntensity: 50, // KfW-55 Standard!
    co2Emissions: 12.1,
    pvSelfConsumption: 89.2,
    peakLoad: 45.8,
    energyCosts: 650.30 // Reduziert durch Effizienz
  });

  const [mockEnergyData] = useState([
    { time: '00:00', consumption: 25, production: 0, grid: 25, temperature: 18 },
    { time: '06:00', consumption: 35, production: 8, grid: 27, temperature: 19 },
    { time: '12:00', consumption: 75, production: 95, grid: -20, temperature: 22 },
    { time: '18:00', consumption: 45, production: 25, grid: 20, temperature: 21 },
    { time: '24:00', consumption: 30, production: 0, grid: 30, temperature: 19 }
  ]);

  const roomData = [
    { room: 'Klassenzimmer', consumption: 35, target: 32 },
    { room: 'IT-Räume', consumption: 18, target: 20 },
    { room: 'Sporthalle', consumption: 12, target: 15 },
    { room: 'Verwaltung', consumption: 8, target: 10 },
    { room: 'Bibliothek', consumption: 6, target: 8 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch building data
        const buildingData = await apiService.getBuilding('realschule-hechingen');
        setBuilding(buildingData);
        
        // Fetch sensors
        const sensorsData = await apiService.getSensors('realschule-hechingen');
        setSensors(sensorsData);
        
        // Fetch energy data
        const energyDataResponse = await apiService.getEnergyData('realschule-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Realschule-Daten');
        console.error('Error fetching realschule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 0.5, // Weniger Schwankung bei KfW-55
        peakLoad: prev.peakLoad + (Math.random() - 0.5) * 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [apiService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Realschule-Daten..." />
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

  // Get specific sensor values
  const energySensor = sensors.find(s => s.type === 'energy');
  const renovationSensor = sensors.find(s => s.type === 'renovation');
  const educationSensor = sensors.find(s => s.type === 'education');

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Eco Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-pink-500/5" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Education Header */}
        <EcoCard variant="glass" size="lg" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg">
                  <School className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-red-300 via-rose-300 to-pink-300 bg-clip-text text-transparent mb-2">
                    Realschule Hechingen
                  </h1>
                  <p className="text-slate-300 text-xl font-medium">
                    Realschule • Baujahr: 1970 • Fläche: 7,000 m² • 800 Schüler
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-green-500/20 border border-green-400/30 rounded-2xl backdrop-blur-sm hover:bg-green-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-green-300" />
                    <span className="text-green-200 font-semibold">KfW-55 STANDARD ERREICHT</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl backdrop-blur-sm hover:bg-blue-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-200 font-semibold">BESTE ENERGIEEFFIZIENZ</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <EcoCard variant="glass" size="sm">
                <div className="text-sm text-slate-400">Energieklasse</div>
                <div className="text-3xl font-bold text-green-400">A</div>
                <div className="text-sm text-slate-400 mt-1">
                  50 kWh/m² durch KfW-55
                </div>
              </EcoCard>
            </div>
          </div>
        </EcoCard>

        {/* Education-Focused Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoKPICard
            title="Energieintensität"
            value="50.0"
            unit="kWh/m²"
            icon={Zap}
            color="green"
            trend={{
              value: 25.3,
              label: "KfW-55 Erfolg",
              isPositive: true
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="KfW-55 Effizienz"
            value={(renovationSensor?.value || 95.2).toFixed(1)}
            unit="%"
            icon={Award}
            color="green"
            progress={renovationSensor?.value || 95.2}
            trend={{
              value: 12.5,
              label: "Zielerfüllung",
              isPositive: true
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Schüleranzahl"
            value={(educationSensor?.value || 800).toString()}
            unit="Schüler"
            icon={Users}
            color="blue"
            trend={{
              value: 2.1,
              label: "vs. Vorjahr",
              isPositive: true
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Energiekosten"
            value="€650"
            unit="/Monat"
            icon={Euro}
            color="green"
            trend={{
              value: 25.3,
              label: "Einsparung",
              isPositive: true
            }}
            className="touch-friendly"
          />
        </div>

        {/* KfW-55 Success Story */}
        <EcoCard variant="glass" size="lg" className="mb-8 touch-friendly">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                KfW-55 Standard erfolgreich erreicht - Energieeffizienz-Vorreiter
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Die Realschule ist das energieeffizienteste Gebäude in Hechingen mit vorbildlichen 50 kWh/m² nach der 2020er Sanierung.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="text-green-400 font-bold text-lg">50</div>
                  <div className="text-green-300 text-sm">kWh/m² erreicht</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
                  <div className="text-blue-400 font-bold text-lg">2020</div>
                  <div className="text-blue-300 text-sm">Sanierung abgeschlossen</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400 font-bold text-lg">€7.455</div>
                  <div className="text-orange-300 text-sm">Einsparung/Jahr</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
                  <div className="text-purple-400 font-bold text-lg">A</div>
                  <div className="text-purple-300 text-sm">Energieklasse</div>
                </div>
              </div>
            </div>
          </div>
        </EcoCard>

        {/* Education Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">KfW-55 Energieverbrauch</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Optimierter Verbrauch durch Sanierung
            </div>
            <LazyLineChart data={mockEnergyData} height={300} />
          </EcoCard>

          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Effizienz nach Bereichen</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Energieverbrauch nach Schul-bereichen
            </div>
            <LazyBarChart data={roomData.map(item => ({ name: item.room, value: item.consumption, target: item.target }))} height={300} />
          </EcoCard>
        </div>

        {/* Education Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Schulbetrieb</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">800</div>
                  <div className="text-sm text-slate-400">Schüler</div>
                </div>
                <div className="text-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">28</div>
                  <div className="text-sm text-slate-400">Klassen</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-300">KfW-Standard</span>
                  <span className="font-bold text-green-400">KfW-55</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-300">Baujahr/Sanierung</span>
                  <span className="font-bold text-white">1970/2020</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-sm font-medium text-slate-300">Nutzfläche</span>
                  <span className="font-bold text-white">7.000 m²</span>
                </div>
              </div>
            </div>
          </EcoCard>

          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">KfW-55 Status</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-300">KfW-55 Standard aktiv</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-300">Wärmepumpe optimal</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-300">Smart Building online</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-300">Beste Effizienz erreicht</span>
                </div>
              </div>
            </div>
          </EcoCard>

          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Sanierungserfolg</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                <h4 className="font-medium text-green-300 mb-2">
                  Sanierungsmaßnahmen 2020
                </h4>
                <div className="text-sm text-green-400">
                  • Vollständige Gebäudedämmung<br/>
                  • Dreifach verglaste Fenster<br/>
                  • Moderne Wärmepumpe<br/>
                  • LED-Beleuchtung<br/>
                  • Smart Building System
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                  <div className="text-xl font-bold text-orange-400">€7.455</div>
                  <div className="text-xs text-slate-400">Einsparung/Jahr</div>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="text-xl font-bold text-green-400">40%</div>
                  <div className="text-xs text-slate-400">Effizienz-Steigerung</div>
                </div>
              </div>
            </div>
          </EcoCard>
        </div>
      </div>
    </div>
  );
};

export default RealschuleDashboard;