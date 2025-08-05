import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Waves, 
  Thermometer, 
  Activity, 
  Users, 
  Droplets, 
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  Badge,
  Target
} from 'lucide-react';

const HallenbadDashboard: React.FC = () => {
  const [, setBuilding] = useState<Building | null>(null);
  const [, setSensors] = useState<Sensor[]>([]);
  const [, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  // Pool-specific KPIs
  const [poolKpis, setPoolKpis] = useState({
    currentConsumption: 340.5,
    mainPoolTemp: 27.5,
    kidsPoolTemp: 30.0,
    dailyVisitors: 156,
    pumpEfficiency: 87.2,
    waterQuality: 98.5,
    heatingCosts: 2850.40,
    energyIntensity: 285.7
  });

  const [poolEnergyData] = useState([
    { time: '00:00', consumption: 285, heating: 180, pumps: 85, lighting: 20, temperature: 27.2 },
    { time: '06:00', consumption: 320, heating: 200, pumps: 95, lighting: 25, temperature: 27.3 },
    { time: '12:00', consumption: 385, heating: 220, pumps: 120, lighting: 45, temperature: 27.6 },
    { time: '18:00', consumption: 355, heating: 210, pumps: 110, lighting: 35, temperature: 27.5 },
    { time: '24:00', consumption: 300, heating: 185, pumps: 90, lighting: 25, temperature: 27.4 }
  ]);

  const poolSystemData = [
    { system: 'Beckenheizung', consumption: 180, efficiency: 78 },
    { system: 'Umwälzpumpen', consumption: 95, efficiency: 87 },
    { system: 'Beleuchtung', consumption: 45, efficiency: 92 },
    { system: 'Lüftung', consumption: 55, efficiency: 81 },
    { system: 'Wasseraufbereitung', consumption: 35, efficiency: 89 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch building data
        const buildingData = await apiService.getBuilding('hallenbad-hechingen');
        setBuilding(buildingData);
        
        // Fetch sensors
        const sensorsData = await apiService.getSensors('hallenbad-hechingen');
        setSensors(sensorsData);
        
        // Fetch energy data
        const energyDataResponse = await apiService.getEnergyData('hallenbad-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Hallenbad-Daten');
        console.error('Error fetching hallenbad data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setPoolKpis(prev => ({
        ...prev,
        currentConsumption: prev.currentConsumption + (Math.random() - 0.5) * 10,
        mainPoolTemp: prev.mainPoolTemp + (Math.random() - 0.5) * 0.2,
        kidsPoolTemp: prev.kidsPoolTemp + (Math.random() - 0.5) * 0.1,
        pumpEfficiency: prev.pumpEfficiency + (Math.random() - 0.5) * 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [apiService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Hallenbad-Daten..." />
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

  // Sensor values available in sensors state if needed

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Eco Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-teal-500/5" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Pool Header */}
        <EcoCard variant="glass" size="lg" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <Waves className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-300 bg-clip-text text-transparent mb-2">
                    Hallenbad Hechingen
                  </h1>
                  <p className="text-slate-300 text-xl font-medium">
                    Schwimmbad • Wasserfläche: 425 m² • Baujahr: 1998
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm hover:bg-red-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Badge className="w-5 h-5 text-red-300" />
                    <span className="text-red-200 font-semibold">HÖCHSTER ENERGIEVERBRAUCH</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl backdrop-blur-sm hover:bg-blue-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-200 font-semibold">{poolKpis.dailyVisitors} Besucher heute</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <EcoCard variant="glass" size="sm">
                <div className="text-sm text-slate-400">Energieklasse</div>
                <div className="text-3xl font-bold text-red-400">D</div>
                <div className="text-sm text-slate-400 mt-1">
                  35% des Gesamtverbrauchs
                </div>
              </EcoCard>
            </div>
          </div>
        </EcoCard>

        {/* Pool-Specific Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoKPICard
            title="Aktuelle Leistung"
            value={poolKpis.currentConsumption.toFixed(1)}
            unit="kW"
            icon={Zap}
            color="blue"
            trend={{
              value: -15.2,
              label: "vs. gestern",
              isPositive: false
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Schwimmbecken"
            value={poolKpis.mainPoolTemp.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            color="blue"
            trend={{
              value: 0.2,
              label: "Zieltemperatur",
              isPositive: true
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Kinderbecken"
            value={poolKpis.kidsPoolTemp.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            color="blue"
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Pumpeneffizienz"
            value={poolKpis.pumpEfficiency.toFixed(1)}
            unit="%"
            icon={Activity}
            color="green"
            progress={poolKpis.pumpEfficiency}
            trend={{
              value: 3.2,
              label: "Optimierung",
              isPositive: true
            }}
            className="touch-friendly"
          />
        </div>

        {/* Energy Consumption Alert */}
        <EcoCard variant="glass" size="lg" className="mb-8 touch-friendly">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Kritischer Energieverbrauch identifiziert
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Das Hallenbad verursacht 35% des gesamten städtischen Energieverbrauchs. Durch Modernisierung können bis zu 40% eingespart werden.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 p-4 rounded-xl border border-red-500/30">
                  <div className="text-red-400 font-bold text-lg">40%</div>
                  <div className="text-red-300 text-sm">Einsparpotential</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-4 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400 font-bold text-lg">€45.000</div>
                  <div className="text-orange-300 text-sm">Jährliche Einsparung</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-4 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold text-lg">4 Jahre</div>
                  <div className="text-yellow-300 text-sm">Amortisationszeit</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="text-green-400 font-bold text-lg">85t</div>
                  <div className="text-green-300 text-sm">CO₂-Einsparung/Jahr</div>
                </div>
              </div>
            </div>
          </div>
        </EcoCard>

        {/* Pool Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Pool-Energieverbrauch</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Aufschlüsselung nach Systemen (24h)
            </div>
            <LazyLineChart data={poolEnergyData} height={300} />
          </EcoCard>

          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-teal-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">System-Effizienz</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Verbrauch und Effizienz der Pool-Systeme
            </div>
            <LazyBarChart 
              data={poolSystemData.map(item => ({ 
                name: item.system, 
                value: item.consumption,
                efficiency: item.efficiency
              }))} 
              height={300} 
            />
          </EcoCard>
        </div>

        {/* Pool Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Beckentemperaturen</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <div>
                  <span className="text-sm font-medium text-cyan-300">Schwimmbecken (25m)</span>
                  <div className="text-xs text-slate-400">Ziel: 27.0°C</div>
                </div>
                <span className="text-2xl font-bold text-cyan-400">{poolKpis.mainPoolTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <div>
                  <span className="text-sm font-medium text-blue-300">Kinderbecken</span>
                  <div className="text-xs text-slate-400">Ziel: 30.0°C</div>
                </div>
                <span className="text-2xl font-bold text-blue-400">{poolKpis.kidsPoolTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                <div>
                  <span className="text-sm font-medium text-green-300">Planschbecken</span>
                  <div className="text-xs text-slate-400">Ziel: 34.0°C</div>
                </div>
                <span className="text-2xl font-bold text-green-400">34.0°C</span>
              </div>
            </div>
          </EcoCard>

          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <Droplets className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Wasserqualität</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-sm font-medium text-green-300">pH-Wert</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-400">7.2</span>
                  <div className="text-xs text-green-400">Optimal</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-sm font-medium text-green-300">Chlor (mg/l)</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-400">0.8</span>
                  <div className="text-xs text-green-400">Gut</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                <span className="text-sm font-medium text-green-300">Trübung (FNU)</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-400">0.2</span>
                  <div className="text-xs text-green-400">Klar</div>
                </div>
              </div>
              <div className="text-center p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <div className="text-2xl font-bold text-cyan-400">{poolKpis.waterQuality}%</div>
                <div className="text-sm text-cyan-300">Wasserqualität</div>
              </div>
            </div>
          </EcoCard>

          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Betrieb & Auslastung</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <h4 className="font-medium text-purple-300 mb-2">
                  Öffnungszeiten
                </h4>
                <div className="text-sm text-purple-400">
                  Mo-Fr: 6:00 - 22:00 Uhr<br/>
                  Sa-So: 8:00 - 20:00 Uhr
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Aktuelle Auslastung</span>
                  <span className="text-sm font-bold text-white">67%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <div className="text-xl font-bold text-cyan-400">{poolKpis.dailyVisitors}</div>
                  <div className="text-xs text-slate-400">Besucher heute</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <div className="text-xl font-bold text-blue-400">24</div>
                  <div className="text-xs text-slate-400">Kurse/Woche</div>
                </div>
              </div>
            </div>
          </EcoCard>
        </div>

        {/* Optimization Recommendations */}
        <EcoCard variant="glass" size="lg" className="mb-8 touch-friendly">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Modernisierungsempfehlungen für maximale Effizienz</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Sofortige Maßnahmen</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <span className="text-sm text-green-300">Pumpensteuerung optimieren</span>
                  <span className="text-green-400 font-bold">-15%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <span className="text-sm text-blue-300">LED-Unterwasserbeleuchtung</span>
                  <span className="text-blue-400 font-bold">-8%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <span className="text-sm text-purple-300">Automatische Abdeckung</span>
                  <span className="text-purple-400 font-bold">-12%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Langfristige Investitionen</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                  <span className="text-sm text-orange-300">Wärmepumpe mit Wärmerückgewinnung</span>
                  <span className="text-orange-400 font-bold">-25%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                  <span className="text-sm text-red-300">Smart Pool Management System</span>
                  <span className="text-red-400 font-bold">-18%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                  <span className="text-sm text-cyan-300">Solarthermie für Warmwasser</span>
                  <span className="text-cyan-400 font-bold">-10%</span>
                </div>
              </div>
            </div>
          </div>
        </EcoCard>
      </div>
    </div>
  );
};

export default HallenbadDashboard;