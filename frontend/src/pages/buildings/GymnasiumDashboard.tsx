import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Sensor } from '@/types';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  GraduationCap, 
  Users, 
  Zap, 
  DollarSign, 
  Leaf, 
  Sun, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  BookOpen,
  Heart,
  Target,
  Trophy
} from 'lucide-react';

const GymnasiumDashboard: React.FC = () => {
  const [, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  // School-specific KPIs
  const [schoolKpis, setSchoolKpis] = useState({
    energyIntensity: 86.2,
    co2Emissions: 21.4,
    pvSelfConsumption: 74.8,
    peakLoad: 78.3,
    energyCosts: 1245.80,
    studentCount: 850,
    teacherCount: 65,
    sportActivities: 45,
    classroomUtilization: 94.2
  });

  const [energyDataMock] = useState([
    { time: '00:00', consumption: 25, production: 0, grid: 25, temperature: 19 },
    { time: '06:00', consumption: 40, production: 8, grid: 32, temperature: 20 },
    { time: '12:00', consumption: 85, production: 95, grid: -10, temperature: 24 },
    { time: '18:00', consumption: 55, production: 30, grid: 25, temperature: 23 },
    { time: '24:00', consumption: 30, production: 0, grid: 30, temperature: 21 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [sensorsData] = await Promise.all([
          apiService.getSensors('gymnasium')
        ]);
        
        setSensors(sensorsData || []);
        
        // Update KPIs with animation
        const interval = setInterval(() => {
          setSchoolKpis(prev => ({
            ...prev,
            energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 2,
            co2Emissions: prev.co2Emissions + (Math.random() - 0.5) * 0.8,
            pvSelfConsumption: Math.max(0, Math.min(100, prev.pvSelfConsumption + (Math.random() - 0.5) * 3)),
          }));
        }, 5000);

        return () => clearInterval(interval);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiService]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Eco Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Education Header Card */}
        <EcoCard variant="glass" size="lg" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent mb-2">
                    Gymnasium Hechingen
                  </h1>
                  <p className="text-slate-300 text-xl font-medium">
                    Historisches Gymnasium • Baujahr: 1909 • Bildungsexzellenz
                  </p>
                  <p className="text-slate-400 text-lg mt-1">
                    8,500 m² • {schoolKpis.studentCount} Schüler • {schoolKpis.teacherCount} Lehrkräfte
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-yellow-500/20 border border-yellow-400/40 rounded-2xl backdrop-blur-sm hover:bg-yellow-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span className="text-yellow-200 font-semibold">HISTORISCHES GEBÄUDE</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-500/20 border border-blue-400/40 rounded-2xl backdrop-blur-sm hover:bg-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-200 font-semibold">{schoolKpis.sportActivities} Sport-AGs</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-purple-500/20 border border-purple-400/40 rounded-2xl backdrop-blur-sm hover:bg-purple-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-300" />
                    <span className="text-purple-200 font-semibold">{schoolKpis.classroomUtilization.toFixed(0)}% Auslastung</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <EcoCard variant="glass" size="sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-bold text-lg">System Online</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Letztes Update: {new Date().toLocaleTimeString('de-DE')}
                </div>
                <div className="text-slate-400 text-xs">
                  Unterricht: 07:45 - 16:30
                </div>
              </EcoCard>
            </div>
          </div>
        </EcoCard>

        {/* Education KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <EcoKPICard
            title="Energieintensität"
            value={schoolKpis.energyIntensity.toFixed(1)}
            unit="kWh/m²"
            icon={Zap}
            color="green"
            trend={{
              value: -12.3,
              label: "vs. Vorjahr",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="CO₂-Emissionen"
            value={schoolKpis.co2Emissions.toFixed(1)}
            unit="t/Jahr"
            icon={Leaf}
            color="green"
            trend={{
              value: -8.7,
              label: "Reduktion",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="PV-Eigenverbrauch"
            value={schoolKpis.pvSelfConsumption.toFixed(1)}
            unit="%"
            icon={Sun}
            color="green"
            progress={schoolKpis.pvSelfConsumption}
            trend={{
              value: 15.2,
              label: "Steigerung",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="Spitzenlast"
            value={schoolKpis.peakLoad.toFixed(1)}
            unit="kW"
            icon={Activity}
            color="blue"
            trend={{
              value: -5.4,
              label: "Optimierung",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="Energiekosten"
            value={`€${schoolKpis.energyCosts.toFixed(0)}`}
            unit="/Monat"
            icon={DollarSign}
            color="green"
            trend={{
              value: -18.9,
              label: "Einsparung",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="Auslastung"
            value={schoolKpis.classroomUtilization.toFixed(1)}
            unit="%"
            icon={BookOpen}
            color="purple"
            progress={schoolKpis.classroomUtilization}
            trend={{
              value: 3.2,
              label: "Steigerung",
              isPositive: true
            }}
            className="touch-friendly"
          />
        </div>

        {/* Education Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EcoCard variant="glass" size="lg" className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" />
              <h3 className="text-2xl font-bold text-white">Schulbetrieb Energieverlauf</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Verbrauch entsprechend Unterrichtszeiten • Optimiert für Bildungsbetrieb
            </div>
            <LazyLineChart data={energyDataMock} height={320} />
          </EcoCard>

          <EcoCard variant="glass" size="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Tagesverteilung</h3>
            </div>
            <div className="text-slate-300 text-sm mb-6">
              Spitzenzeiten während Schulbetrieb
            </div>
            <LazyBarChart data={energyDataMock} height={280} />
          </EcoCard>

          <div className="chart-glass-container">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Bildungs-KPIs</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-emerald-200/80">Unterrichtsräume aktiv</span>
                <span className="text-green-400 font-bold">34/42</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-emerald-200/80">Sport-/AG-Räume</span>
                <span className="text-green-400 font-bold">12/15</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-emerald-200/80">Digitale Tafeln online</span>
                <span className="text-green-400 font-bold">38/42</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-emerald-200/80">WLAN-Abdeckung</span>
                <span className="text-green-400 font-bold">98.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Education Success Alert */}
        <EcoCard variant="glass" size="lg" className="touch-friendly">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Energieeffizienz im Bildungsbereich
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Das Gymnasium Hechingen zeigt vorbildliche Energieeffizienz mit 15% besserer Performance als vergleichbare Schulen. Die Kombination aus modernster Technik, pädagogischem Umweltbewusstsein und intelligentem Gebäudemanagement macht die Schule zu einem Vorreiter im nachhaltigen Bildungswesen.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="text-green-400 font-bold text-lg">115 Jahre</div>
                  <div className="text-green-300 text-sm">Bildungsgeschichte</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-teal-500/20 p-4 rounded-xl border border-blue-500/30">
                  <div className="text-blue-400 font-bold text-lg">€1.2M</div>
                  <div className="text-blue-300 text-sm">Modernisierung 2022</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
                  <div className="text-purple-400 font-bold text-lg">32%</div>
                  <div className="text-purple-300 text-sm">Effizienzsteigerung</div>
                </div>
              </div>
            </div>
          </div>
        </EcoCard>
      </div>
    </div>
  );
};

export default GymnasiumDashboard;