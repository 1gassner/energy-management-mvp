import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  GraduationCap, 
  Users, 
  Zap, 
  Euro, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Wrench,
  Target,
  BookOpen
} from 'lucide-react';

const WerkrealschuleDashboard: React.FC = () => {
  const [, setBuilding] = useState<Building | null>(null);
  const [, setSensors] = useState<Sensor[]>([]);
  const [, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  // Vocational School KPIs
  const schoolKpis = {
    energyIntensity: 95.8,
    studentCount: 150,
    energyCosts: 890.25,
    classroomUtilization: 35.2
  };

  const energyDataMock = [
    { time: '00:00', consumption: 20, production: 0, grid: 20, temperature: 18 },
    { time: '06:00', consumption: 25, production: 5, grid: 20, temperature: 19 },
    { time: '12:00', consumption: 45, production: 35, grid: 10, temperature: 22 },
    { time: '18:00', consumption: 30, production: 15, grid: 15, temperature: 21 },
    { time: '24:00', consumption: 22, production: 0, grid: 22, temperature: 19 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const buildingData = await apiService.getBuilding('werkrealschule-hechingen');
        setBuilding(buildingData);
        
        const sensorsData = await apiService.getSensors('werkrealschule-hechingen');
        setSensors(sensorsData);
        
        const energyDataResponse = await apiService.getEnergyData('werkrealschule-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Werkrealschule-Daten');
        console.error('Error fetching werkrealschule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Werkrealschule-Daten..." />
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-500/5" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Vocational Header */}
        <EcoCard variant="glass" size="lg" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent mb-2">
                    Werkrealschule Hechingen
                  </h1>
                  <p className="text-slate-300 text-xl font-medium">
                    Werkrealschule • Baujahr: 1980 • Fläche: 5,500 m² • 150 Schüler
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-yellow-500/20 border border-yellow-400/30 rounded-2xl backdrop-blur-sm hover:bg-yellow-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-yellow-300" />
                    <span className="text-yellow-200 font-semibold">RENOVIERUNG 2025 GEPLANT</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm hover:bg-red-500/30 transition-all touch-friendly">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-red-300" />
                    <span className="text-red-200 font-semibold">GERINGE AUSLASTUNG</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <EcoCard variant="glass" size="sm">
                <div className="text-sm text-slate-400">Energieklasse</div>
                <div className="text-3xl font-bold text-red-400">E</div>
                <div className="text-sm text-slate-400 mt-1">
                  Dringend sanierungsbedürftig
                </div>
              </EcoCard>
            </div>
          </div>
        </EcoCard>

        {/* Vocational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoKPICard
            title="Energieintensität"
            value={schoolKpis.energyIntensity.toFixed(1)}
            unit="kWh/m²"
            icon={Zap}
            color="purple"
            trend={{
              value: -25.2,
              label: "Sehr hoch",
              isPositive: false
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Schüleranzahl"
            value={schoolKpis.studentCount.toString()}
            unit="Schüler"
            icon={Users}
            color="orange"
            trend={{
              value: -12.3,
              label: "Rückgang",
              isPositive: false
            }}
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Energiekosten"
            value={`€${schoolKpis.energyCosts.toFixed(0)}`}
            unit="/Monat"
            icon={Euro}
            color="purple"
            className="touch-friendly"
          />
          
          <EcoKPICard
            title="Raumauslastung"
            value={schoolKpis.classroomUtilization.toFixed(1)}
            unit="%"
            icon={BookOpen}
            color="purple"
            progress={schoolKpis.classroomUtilization}
            trend={{
              value: -12.3,
              label: "Sehr niedrig",
              isPositive: false
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
                Werkrealschule - Dringende Optimierung erforderlich
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Nur 150 Schüler bei 5.500 m² Fläche. Renovierung 2025 geplant für bessere Energieeffizienz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 p-4 rounded-xl border border-red-500/30">
                  <div className="text-red-400 font-bold text-lg">35%</div>
                  <div className="text-red-300 text-sm">Auslastung</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-4 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400 font-bold text-lg">€450k</div>
                  <div className="text-orange-300 text-sm">Sanierungskosten</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-4 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold text-lg">2025</div>
                  <div className="text-yellow-300 text-sm">Renovierung</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="text-green-400 font-bold text-lg">60%</div>
                  <div className="text-green-300 text-sm">Einsparpotential</div>
                </div>
              </div>
            </div>
          </div>
        </EcoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Energieverbrauch (24h)</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Niedriger Verbrauch durch geringe Auslastung
            </div>
            <LazyLineChart data={energyDataMock} height={300} />
          </EcoCard>

          <EcoCard variant="glass" size="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Renovierungsplanung 2025</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/20 rounded-xl border border-orange-500/30">
                <h4 className="font-medium text-orange-300 mb-2">
                  Geplante Maßnahmen
                </h4>
                <div className="text-sm text-orange-400">
                  • LED-Beleuchtung (20% Einsparung)<br/>
                  • Neue Heizungsanlage (15% Einsparung)<br/>
                  • Smart Building System
                </div>
              </div>
            </div>
          </EcoCard>
        </div>
      </div>
    </div>
  );
};

export default WerkrealschuleDashboard;